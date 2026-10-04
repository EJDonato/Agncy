import { eq } from "drizzle-orm";
import { ThinkingLevel } from "@google/genai";
import { db } from "@/lib/db";
import { brandProfiles, styleRules } from "@/lib/db/schema";
import type { SeraChatTurn } from "./sera-chat-contract";
import { SeraChatDecisionGeminiSchema, SeraChatDecisionSchema } from "./sera-chat-contract";
import { getGeminiClient } from "./gemini";
import { GEMINI_REVISION_MODELS } from "./models";
import { reviseScript } from "./script-reviser";

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
- For discuss, revisionInstruction must be an empty string.
- For revise, reply should briefly state what you changed, and revisionInstruction must fully describe the requested edit while preserving all unaffected material.`;

  const prompt = `RECENT CONVERSATION:
${conversationText(params.recentTurns)}

CURRENT SCRIPT:
${params.currentContent}

NEW CREATOR MESSAGE:
${params.message}`;

  const ai = getGeminiClient();
  let lastError: unknown;
  for (const model of GEMINI_REVISION_MODELS) {
    try {
      const response = await withTimeout(ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: SeraChatDecisionGeminiSchema,
        },
      }), CHAT_TIMEOUT_MS);
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
      lastError = error;
      console.warn(`Model ${model} failed for Sera conversation:`, error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Sera could not respond right now.");
}
