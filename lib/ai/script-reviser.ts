import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { brandProfiles, styleRules } from "@/lib/db/schema";
import { getGeminiClient } from "./gemini";
import { GEMINI_FLASH_MODELS } from "./models";

const RevisionResponseSchema = z.object({
  revised_content: z.string().min(1),
});

interface ReviseScriptParams {
  currentContent: string;
  instruction: string;
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Script revision timed out")), 45_000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
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

Apply the user's instruction precisely. Preserve useful markdown structure and return the complete revised script, not commentary.`;
  const prompt = `USER INSTRUCTION:\n${params.instruction}\n\nCURRENT SCRIPT:\n${params.currentContent}`;
  const ai = getGeminiClient();
  let lastError: unknown;

  for (const model of GEMINI_FLASH_MODELS) {
    try {
      const response = await withTimeout(ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: { revised_content: { type: "STRING" } },
            required: ["revised_content"],
          },
        },
      }));
      if (response.text) {
        return RevisionResponseSchema.parse(JSON.parse(response.text)).revised_content;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed for script revision:`, error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini could not revise the script.");
}
