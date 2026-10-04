import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { brandProfiles } from "@/lib/db/schema";
import { getGeminiClient } from "./gemini";
import { getPastContentContext } from "./content-strategist";
import { ContentIdeasJsonSchema, ContentIdeasResponseSchema, type ContentIdea } from "./schemas";

const ANTIGRAVITY_AGENT = "antigravity-preview-09-2026";
const RESEARCH_TIMEOUT_MS = 120_000;

interface ResearchTrendIdeasParams {
  brandId: string;
  prompt?: string;
}

export async function researchTrendIdeas({ brandId, prompt: strategistBrief }: ResearchTrendIdeasParams): Promise<ContentIdea[]> {
  const profile = db.select().from(brandProfiles).where(eq(brandProfiles.id, brandId)).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before researching trends.");

  const input = `Act as Vela, the Content Strategist for ${profile.creatorName}.
Niche: ${profile.niche}
Audience: ${profile.targetAudience}
Voice: ${profile.toneOfVoice}
Language: ${profile.languageMix}
Guardrails: ${profile.dosAndDonts || "None supplied"}

Use Google Search to identify timely, credible themes and audience questions that could become short-form content. Compare those signals with the creator's past content below. Produce exactly 6 distinct ideas that are useful now but do not repeat an existing title.

${strategistBrief ? `Creator direction: ${strategistBrief}` : "No additional creator direction was supplied."}

${getPastContentContext(brandId)}

For every idea, explain the specific current signal and its fit with past content in whySuggested. Do not invent facts, metrics, or sources. predictedFitScore must be a decimal from 0 to 1. Return only the requested JSON.`;

  const interaction = await getGeminiClient().interactions.create({
    agent: ANTIGRAVITY_AGENT,
    input,
    environment: "remote",
    tools: [{ type: "google_search" }],
    store: false,
    agent_config: {
      type: "antigravity",
      model: "gemini-3.8-flash",
      max_total_tokens: "18000",
    },
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: ContentIdeasJsonSchema,
    },
  }, { timeout: RESEARCH_TIMEOUT_MS });

  if (!interaction.output_text) throw new Error("Trend research finished without returning content ideas.");
  return ContentIdeasResponseSchema.parse(JSON.parse(interaction.output_text)).ideas;
}
