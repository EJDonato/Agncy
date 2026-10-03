import { getGeminiClient } from "./gemini";
import { db } from "@/lib/db";
import { brandProfiles, styleRules, scripts, scriptVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ScriptDraftResponseSchema, ScriptDraftSchema, formatScriptDraftToMarkdown, type ScriptDraft } from "./schemas";
import { buildFewShotContext } from "./few-shot-context";
import crypto from "node:crypto";
import { GEMINI_FLASH_MODELS } from "./models";

export interface GenerateScriptParams {
  topic: string;
  format?: string;
  targetDurationSec?: number;
}

export async function generateScriptDraft(params: GenerateScriptParams): Promise<{
  scriptId: string;
  draft: ScriptDraft;
  markdownContent: string;
}> {
  const { topic, format = "Reel", targetDurationSec = 45 } = params;

  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) {
    throw new Error("Set up your Brand Brain profile before generating a script.");
  }

  // 2. Fetch Active Style Rules
  const activeRules = db
    .select()
    .from(styleRules)
    .where(eq(styleRules.status, "active"))
    .all();

  const fewShotContext = buildFewShotContext();

  const rulesText =
    activeRules.length > 0
      ? activeRules.map((r, i) => `${i + 1}. [${r.category.toUpperCase()}] ${r.ruleText}`).join("\n")
      : "1. Hook must start directly with a counter-intuitive observation; no greetings.\n2. Keep spoken phrasing conversational Taglish.\n3. Keep pacing punchy (130-150 words total).";

  const systemInstruction = `You are the lead scriptwriter for Agncy, an in-house studio for creator ${profile.creatorName}.
Niche: ${profile.niche}
Target Audience: ${profile.targetAudience}
Tone: ${profile.toneOfVoice}
Language Mix: ${profile.languageMix}
Creator Guardrails: ${profile.dosAndDonts || "None supplied"}

CRITICAL RULES:
${rulesText}

Generate a short-form video script (${format}, ~${targetDurationSec} seconds). Provide visual cues and spoken cues.
Return ONLY valid JSON strictly matching the schema.`;

  const prompt = `Topic: "${topic}"
Target Duration: ${targetDurationSec} seconds
Format: ${format}
${fewShotContext ? `Use these recent finalized scripts only as writing-style references. Match their structure, rhythm, transitions, vocabulary, and language mix. Do not copy their topics or factual claims.\n\n${fewShotContext}` : ""}`;

  const ai = getGeminiClient();

  let rawJsonText = "";
  let lastError: unknown = null;

  for (const model of GEMINI_FLASH_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: ScriptDraftResponseSchema,
        },
      });

      if (response.text) {
        rawJsonText = response.text;
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} failed, trying fallback:`, err);
    }
  }

  if (!rawJsonText) {
    throw lastError || new Error("Failed to generate script draft with Gemini");
  }

  const parsedJson = JSON.parse(rawJsonText);
  const dataToValidate = Array.isArray(parsedJson) ? parsedJson[0] : parsedJson;
  const validatedDraft = ScriptDraftSchema.parse(dataToValidate);
  const markdownContent = formatScriptDraftToMarkdown(validatedDraft);

  const scriptId = `scr_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const versionId = `ver_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  // Persist into SQLite
  db.transaction((tx) => {
    tx.insert(scripts).values({
      id: scriptId,
      brandId: profile.id,
      title: validatedDraft.title,
      format,
      targetDurationSec,
      status: "drafting",
    }).run();

    tx.insert(scriptVersions).values({
      id: versionId,
      scriptId,
      versionNumber: 1,
      versionType: "ai_initial_draft",
      hookText: validatedDraft.hook.spoken_text,
      bodyText: validatedDraft.body_beats.map((b) => b.spoken_text).join(" "),
      ctaText: validatedDraft.cta.spoken_text,
      fullContent: markdownContent,
    }).run();
  });

  return {
    scriptId,
    draft: validatedDraft,
    markdownContent,
  };
}
