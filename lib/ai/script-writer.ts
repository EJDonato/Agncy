import { getGeminiClient } from "./gemini";
import { db } from "@/lib/db";
import { brandProfiles, styleRules, scripts, scriptVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ScriptDraftSchema, formatScriptDraftToMarkdown, type ScriptDraft } from "./schemas";
import crypto from "node:crypto";

export interface GenerateScriptParams {
  topic: string;
  format?: string;
  targetDurationSec?: number;
}

const CANDIDATE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

export async function generateScriptDraft(params: GenerateScriptParams): Promise<{
  scriptId: string;
  draft: ScriptDraft;
  markdownContent: string;
}> {
  const { topic, format = "Reel", targetDurationSec = 45 } = params;

  // 1. Fetch Brand Profile (or use defaults)
  const profile = db.select().from(brandProfiles).limit(1).get() || {
    creatorName: "Elton",
    niche: "Civic innovation, grassroots community apps, and public interest technology",
    targetAudience: "Filipino developers, community organizers, youth civic builders",
    toneOfVoice: "Direct, empathetic, grounded, analytical. No cringe hype or generic buzzwords.",
    languageMix: "Conversational Taglish (Filipino/English balance with emotional particles: kasi, naman, talaga)",
    dosAndDonts: "Do not start with 'Hey guys' or generic greetings. Start directly at the paradox.",
  };

  // 2. Fetch Active Style Rules
  const activeRules = db
    .select()
    .from(styleRules)
    .where(eq(styleRules.status, "active"))
    .all();

  // 3. Fetch Top Few-Shots
  const pastScripts = db
    .select()
    .from(scripts)
    .where(eq(scripts.status, "finalized"))
    .orderBy(desc(scripts.createdAt))
    .limit(2)
    .all();

  const rulesText =
    activeRules.length > 0
      ? activeRules.map((r, i) => `${i + 1}. [${r.category.toUpperCase()}] ${r.ruleText}`).join("\n")
      : "1. Hook must start directly with a counter-intuitive observation; no greetings.\n2. Keep spoken phrasing conversational Taglish.\n3. Keep pacing punchy (130-150 words total).";

  const systemInstruction = `You are the lead scriptwriter for Agncy, an in-house studio for creator ${profile.creatorName}.
Niche: ${profile.niche}
Target Audience: ${profile.targetAudience}
Tone: ${profile.toneOfVoice}
Language Mix: ${profile.languageMix}

CRITICAL RULES:
${rulesText}

Generate a short-form video script (${format}, ~${targetDurationSec} seconds). Provide visual cues and spoken cues.
Return ONLY valid JSON strictly matching the schema.`;

  const prompt = `Topic: "${topic}"
Target Duration: ${targetDurationSec} seconds
Format: ${format}
${pastScripts.length > 0 ? `Past Reference Scripts:\n${pastScripts.map((s) => s.title).join(", ")}` : ""}`;

  const ai = getGeminiClient();

  let rawJsonText = "";
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              estimated_duration_sec: { type: "INTEGER" },
              total_word_count: { type: "INTEGER" },
              hook: {
                type: "OBJECT",
                properties: {
                  visual_cue: { type: "STRING" },
                  spoken_text: { type: "STRING" },
                  duration_est_sec: { type: "INTEGER" },
                },
                required: ["visual_cue", "spoken_text", "duration_est_sec"],
              },
              body_beats: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    beat_number: { type: "INTEGER" },
                    visual_cue: { type: "STRING" },
                    spoken_text: { type: "STRING" },
                    pacing: { type: "STRING", enum: ["rapid", "deliberate", "punchy"] },
                  },
                  required: ["beat_number", "visual_cue", "spoken_text", "pacing"],
                },
              },
              cta: {
                type: "OBJECT",
                properties: {
                  visual_cue: { type: "STRING" },
                  spoken_text: { type: "STRING" },
                },
                required: ["visual_cue", "spoken_text"],
              },
            },
            required: ["title", "estimated_duration_sec", "total_word_count", "hook", "body_beats", "cta"],
          },
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
      brandId: profile && "id" in profile && profile.id ? (profile.id as string) : "default_profile",
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
