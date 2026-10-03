import { eq } from "drizzle-orm";
import { ThinkingLevel } from "@google/genai";
import { db } from "@/lib/db";
import { brandProfiles, styleRules } from "@/lib/db/schema";
import { getGeminiClient } from "./gemini";
import { GEMINI_REVISION_MODELS } from "./models";
import { ScriptDraftResponseSchema, ScriptDraftSchema, formatScriptDraftToMarkdown } from "./schemas";

interface ReviseScriptParams {
  currentContent: string;
  instruction: string;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Script revision timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function getApiStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

export async function reviseScript(params: ReviseScriptParams): Promise<string> {
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before revising a script.");

  const activeRules = db
    .select()
    .from(styleRules)
    .where(eq(styleRules.status, "active"))
    .all();
  const rules = activeRules.map((rule) => `- ${rule.ruleText}`).join("\n") || "- Preserve the creator's natural voice.";
  const systemInstruction = `You revise short-form video scripts for ${profile.creatorName}.
Tone: ${profile.toneOfVoice}
Language: ${profile.languageMix}
Guardrails: ${profile.dosAndDonts || "None"}
Active style rules:
${rules}

Apply the user's instruction precisely. Always return a structured script with a hook, separate body beats, visual cues, pacing, and CTA. Never collapse the script into one paragraph.`;
  const prompt = `USER INSTRUCTION:\n${params.instruction}\n\nCURRENT SCRIPT:\n${params.currentContent}`;
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
          responseSchema: ScriptDraftResponseSchema,
        },
      }), 90_000);
      if (response.text) {
        const revisedDraft = ScriptDraftSchema.parse(JSON.parse(response.text));
        return formatScriptDraftToMarkdown(revisedDraft);
      }
    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed for script revision:`, error);
    }
  }

  const status = getApiStatus(lastError);
  if (status === 429 || status === 503) {
    throw new Error("Gemini is busy right now. Please try the revision again in a minute.");
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini could not revise the script.");
}
