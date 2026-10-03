import { getGeminiClient } from "./gemini";
import { db } from "@/lib/db";
import { styleRules } from "@/lib/db/schema";
import crypto from "node:crypto";
import { z } from "zod";

export interface AnalyzeEditParams {
  brandId?: string;
  scriptTitle: string;
  initialDraft: string;
  finalEdit: string;
  survivalPercentage: number;
}

const CANDIDATE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const StyleAnalysisSchema = z.object({
  editSummary: z.string().min(1),
  proposedRule: z.object({
    category: z.enum(["hook", "pacing", "vocabulary", "structure", "tone"]),
    ruleText: z.string().min(5),
    rationale: z.string().min(1),
  }).nullable().optional(),
});

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Style analysis timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function analyzeEditAndSynthesizeStyle(params: AnalyzeEditParams): Promise<{
  editSummary: string;
  proposedRule?: {
    category: "hook" | "pacing" | "vocabulary" | "structure" | "tone";
    ruleText: string;
    rationale: string;
  };
}> {
  const { scriptTitle, initialDraft, finalEdit, survivalPercentage } = params;

  const prompt = `You are the style analyst for Agncy. Compare the AI initial draft vs the creator's final version for the script titled "${scriptTitle}".
Draft Survival Rate: ${survivalPercentage}%

AI INITIAL DRAFT:
"""
${initialDraft.slice(0, 1500)}
"""

CREATOR'S FINAL EDIT:
"""
${finalEdit.slice(0, 1500)}
"""

Task:
1. Provide a concise, 1-2 sentence edit summary of what the user changed (e.g. "Trimmed opening hook to 6 words; added Taglish filler 'kasi' and 'naman'; removed corporate exposition.").
2. If there is a distinct, high-confidence rule to learn from this edit, propose one clear constraint rule.

Respond in JSON with this structure:
{
  "editSummary": "string",
  "proposedRule": {
    "category": "hook" | "pacing" | "vocabulary" | "structure" | "tone",
    "ruleText": "string",
    "rationale": "string"
  } | null
}`;

  try {
    const ai = getGeminiClient();
    let rawJsonText = "";

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await withTimeout(ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                editSummary: { type: "STRING" },
                proposedRule: {
                  type: "OBJECT",
                  properties: {
                    category: { type: "STRING", enum: ["hook", "pacing", "vocabulary", "structure", "tone"] },
                    ruleText: { type: "STRING" },
                    rationale: { type: "STRING" },
                  },
                  required: ["category", "ruleText", "rationale"],
                },
              },
              required: ["editSummary"],
            },
          },
        }), 30_000);

        if (response.text) {
          rawJsonText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`Model ${model} failed for style synthesis, trying fallback:`, err);
      }
    }

    if (!rawJsonText) {
      return {
        editSummary: `Script finalized with ${survivalPercentage}% AI draft survival.`,
      };
    }

    const parsed = StyleAnalysisSchema.parse(JSON.parse(rawJsonText));
    const editSummary = parsed.editSummary;

    if (parsed.proposedRule && parsed.proposedRule.ruleText) {
      const brandId = params.brandId || "default_profile";
      db.insert(styleRules).values({
        id: `rule_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        brandId,
        category: parsed.proposedRule.category || "tone",
        ruleText: parsed.proposedRule.ruleText,
        rationale: parsed.proposedRule.rationale || `Derived from editing "${scriptTitle}"`,
        status: "proposed",
        confidenceScore: 0.85,
      }).run();

      return {
        editSummary,
        proposedRule: parsed.proposedRule,
      };
    }

    return { editSummary };
  } catch (err) {
    console.error("Style synthesis error:", err);
    return {
      editSummary: `Script finalized with ${survivalPercentage}% AI draft survival.`,
    };
  }
}
