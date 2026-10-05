import { eq } from "drizzle-orm";
import { ThinkingLevel } from "@google/genai";
import { db } from "@/lib/db";
import { brandProfiles, styleRules } from "@/lib/db/schema";
import { SeraChatDecisionGeminiSchema, SeraChatDecisionSchema } from "./sera-chat-contract";
import { geminiFailureLog, summarizeGeminiFailures } from "./gemini-availability";
import { getGeminiClient } from "./gemini";
import { GEMINI_REVISION_MODELS } from "./models";
import { reviseScript } from "./script-reviser";
import type { SeraChatTurn } from "@/lib/scripts/sera-chat-contract";

const CHAT_TIMEOUT_MS = 60_000;

interface ConverseWithSeraParams {
  currentContent: string;
  message: string;
  recentTurns: SeraChatTurn[];
}

export interface SeraConversationResponse {
  action: "discuss" | "revise";
  reply: string;
  revisedContent: string | null;
}

export class SeraAvailabilityError extends Error {
  constructor(
    public readonly kind: "quota_exhausted" | "unavailable",
    public readonly retryAfterSeconds: number | null,
    message: string,
  ) {
    super(message);
    this.name = "SeraAvailabilityError";
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Sera took too long to respond.")), timeoutMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function conversationText(turns: SeraChatTurn[]): string {
  if (!turns.length) return "No earlier conversation for this script.";
  return turns.map((turn) => [
    `Creator: ${turn.userMessage}`,
    `Sera: ${turn.assistantMessage}`,
    turn.action === "revise" ? "Result: Sera revised the script." : "Result: No script change.",
  ].join("\n")).join("\n\n");
}

export async function converseWithSera(params: ConverseWithSeraParams): Promise<SeraConversationResponse> {
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before talking with Sera.");
  const activeRules = db.select().from(styleRules).where(eq(styleRules.status, "active")).all();
  const rules = activeRules.map((rule) => `- ${rule.ruleText}`).join("\n") || "- Preserve the creator's natural voice.";

  const systemInstruction = `You are Sera, ${profile.creatorName}'s dedicated script-writing partner inside Agncy.
You are perceptive, candid, concise, and collaborative. Speak naturally as a trusted creative colleague, not as a generic assistant.

Creator niche: ${profile.niche}
Audience: ${profile.targetAudience}
Tone: ${profile.toneOfVoice}
Language mix: ${profile.languageMix}
Guardrails: ${profile.dosAndDonts || "None supplied"}
Active style rules:
${rules}

Decide whether the creator wants discussion or an applied revision.
- Use "discuss" for questions, critique, explanations, brainstorming, suggested options, or ambiguous requests. Do not change the script.
- Use "revise" only when the creator clearly asks you to change, rewrite, apply, replace, shorten, expand, or otherwise edit the current script.
- If the creator refers to an earlier option, resolve it from the conversation and make revisionInstruction self-contained.
- Keep reply under 90 words. Be specific to the current script and do not use empty praise.
- Use readable Markdown inside reply when useful: bold key points, bullets, and paragraph breaks. Do not use raw HTML.
- For discuss, revisionInstruction must be an empty string.
- For revise, reply should briefly state what you changed, and revisionInstruction must fully describe the requested edit while preserving all unaffected material.`;

  const jsonInstruction = `Return only a JSON object with exactly these fields:
{"mode":"discuss or revise","reply":"concise response","revisionInstruction":"empty for discuss; complete instruction for revise"}`;

  const prompt = `${jsonInstruction}

RECENT CONVERSATION:
${conversationText(params.recentTurns)}

CURRENT SCRIPT:
${params.currentContent}

NEW CREATOR MESSAGE:
${params.message}`;

  const ai = getGeminiClient();
  const failures: unknown[] = [];
  for (const model of GEMINI_REVISION_MODELS) {
    try {
      const isGemma = model.startsWith("gemma-");
      const thinkingLevel = isGemma ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW;
      const response = await withTimeout(ai.models.generateContent({
        model,
        contents: isGemma ? `${systemInstruction}\n\n${prompt}` : prompt,
        config: {
          httpOptions: { timeout: isGemma ? 120_000 : 60_000 },
          maxOutputTokens: 768,
          thinkingConfig: { thinkingLevel },
          responseMimeType: "application/json",
          ...(!isGemma && { systemInstruction, responseSchema: SeraChatDecisionGeminiSchema }),
        },
      }), isGemma ? 120_000 : CHAT_TIMEOUT_MS);
      if (!response.text) continue;
      const decision = SeraChatDecisionSchema.parse(JSON.parse(response.text));
      if (decision.mode === "discuss") {
        return { action: "discuss", reply: decision.reply, revisedContent: null };
      }
      const revisedContent = await reviseScript({
        currentContent: params.currentContent,
        instruction: decision.revisionInstruction,
      });
      return { action: "revise", reply: decision.reply, revisedContent };
    } catch (error) {
      failures.push(error);
      console.warn("Sera model attempt failed", { model, ...geminiFailureLog(error) });
    }
  }
  const summary = summarizeGeminiFailures(failures);
  if (summary.hasQuotaFailure) {
    throw new SeraAvailabilityError(
      "quota_exhausted",
      summary.retryAfterSeconds,
      summary.hasUnavailableFailure
        ? "Gemini's primary quota is exhausted and its fallback models are currently busy."
        : "Gemini's request quota is exhausted.",
    );
  }
  throw new SeraAvailabilityError("unavailable", null, "Gemini is temporarily unavailable.");
}
