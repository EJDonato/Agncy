import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { brandProfiles } from "@/lib/db/schema";
import { generateStructuredContentIdeas } from "./content-idea-generator";
import { getGeminiClient } from "./gemini";
import { getPastContentContext } from "./content-strategist";
import type { ContentIdea } from "./schemas";

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

Use Google Search to identify timely, credible themes and audience questions that could become short-form content. Compare those signals with the creator's past content below. Prepare a concise research dossier with enough evidence to develop 6 distinct ideas that are useful now but do not repeat an existing title.

${strategistBrief ? `Creator direction: ${strategistBrief}` : "No additional creator direction was supplied."}

${getPastContentContext(brandId)}

For each opportunity, explain the specific current signal, its source, and its fit with past content. Do not invent facts, metrics, or sources.`;

  const interaction = await getGeminiClient().interactions.create({
    agent: ANTIGRAVITY_AGENT,
    input,
    environment: "remote",
    tools: [{ type: "google_search" }],
    agent_config: {
      type: "antigravity",
      model: "gemini-3.8-flash",
      max_total_tokens: "50000",
    },
  }, { timeout: RESEARCH_TIMEOUT_MS });

  const research = interaction.output_text?.trim();
  if (!research) {
    const details = interaction.errors?.map((error) => error.message).filter(Boolean).join(" ");
    const suffix = details ? ` ${details}` : "";
    throw new Error(`Trend research did not complete (${interaction.status}).${suffix}`);
  }

  const synthesisPrompt = `Turn the research dossier below into exactly 6 distinct short-form content ideas.
Use only claims supported by the dossier. Do not repeat titles listed in its past-content context. Each whySuggested must name the current signal and explain why it fits this creator. predictedFitScore must be a decimal from 0 to 1. Return only JSON matching the requested schema.

RESEARCH DOSSIER:
${research}`;

  return generateStructuredContentIdeas(synthesisPrompt);
}
