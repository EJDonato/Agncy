import { getGeminiClient } from "./gemini";
import { db } from "@/lib/db";
import { styleRules } from "@/lib/db/schema";
import crypto from "node:crypto";

export interface AnalyzeEditParams {
  brandId?: string;
  scriptTitle: string;
  initialDraft: string;
  finalEdit: string;
  survivalPercentage: number;
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
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const editSummary = parsed.editSummary || `Creator modified script (${survivalPercentage}% AI draft retained).`;

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
