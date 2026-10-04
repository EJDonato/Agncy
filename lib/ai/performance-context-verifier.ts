import { getGeminiClient } from "./gemini";
import { GEMINI_ANALYST_MODELS } from "./models";
import {
  ContextCandidatesGeminiSchema,
  ContextCandidatesSchema,
  ContextVerificationJsonSchema,
  ContextVerificationSchema,
  type ContextCandidate,
  type ContextSignal,
} from "./context-schemas";
import { getFreshContextSignals, normalizeContextSubject, saveContextSignals } from "@/lib/db/queries/context-signals";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";

const ANTIGRAVITY_AGENT = "antigravity-preview-09-2026";

function candidatePostData(posts: PostWithLatestMetrics[]): string {
  return [...posts]
    .sort((left, right) => (right.views + right.interactions * 10) - (left.views + left.interactions * 10))
    .slice(0, 24)
    .map((post) => JSON.stringify({
      title: post.normalizedTitle || post.rawTitle || "Untitled post",
      publishedAt: post.publishedAt,
      views: post.views,
      interactions: post.interactions,
    }))
    .join("\n");
}

async function extractCandidates(posts: PostWithLatestMetrics[]): Promise<ContextCandidate[]> {
  const prompt = `Today is ${new Date().toISOString().slice(0, 10)}. From these high-performing posts, extract up to 6 specific named programs, applications, financial-assistance opportunities, events, campaigns, deadlines, or policies whose current availability may affect whether the creator can make a useful follow-up. Do not extract broad evergreen themes. Return an empty list if none require freshness verification.\n\n${candidatePostData(posts)}`;
  const ai = getGeminiClient();
  for (const model of GEMINI_ANALYST_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          httpOptions: { timeout: 90_000 },
          responseMimeType: "application/json",
          responseSchema: ContextCandidatesGeminiSchema,
        },
      });
      if (response.text) return ContextCandidatesSchema.parse(JSON.parse(response.text)).subjects;
    } catch {
      // Try the next configured Flash model.
    }
  }
  return [];
}

async function researchCandidates(candidates: ContextCandidate[]): Promise<ContextSignal[]> {
  if (!candidates.length) return [];
  const input = `Today is ${new Date().toISOString().slice(0, 10)}. Verify the current status of each subject below using Google Search. Prefer official government, institution, school, or program sources. Classify each as active, ended, evergreen, recurring_closed, or unclear. Never infer that an old application or program remains open. Return one result per subject, preserve its exact subject text, and include the strongest authoritative source URL.\n\n${candidates.map((candidate) => `- ${candidate.subject}: ${candidate.whyTimeSensitive}`).join("\n")}`;
  const interaction = await getGeminiClient().interactions.create({
    agent: ANTIGRAVITY_AGENT,
    input,
    environment: "remote",
    tools: [{ type: "google_search" }],
    agent_config: { type: "antigravity", model: "gemini-3.8-flash", max_total_tokens: "12000" },
    response_format: { type: "text", mime_type: "application/json", schema: ContextVerificationJsonSchema },
  }, { timeout: 120_000 });
  if (!interaction.output_text) return [];
  return ContextVerificationSchema.parse(JSON.parse(interaction.output_text)).signals;
}

export async function verifyPerformanceContext(posts: PostWithLatestMetrics[], brandId: string): Promise<ContextSignal[]> {
  const candidates = await extractCandidates(posts);
  if (!candidates.length) return [];

  const freshSignals = getFreshContextSignals(brandId);
  const freshBySubject = new Map(freshSignals.map((signal) => [signal.normalizedSubject, signal]));
  const cached = candidates.map((candidate) => freshBySubject.get(normalizeContextSubject(candidate.subject))).filter((signal): signal is NonNullable<typeof signal> => Boolean(signal));
  const unresolved = candidates.filter((candidate) => !freshBySubject.has(normalizeContextSubject(candidate.subject)));

  let researched: ContextSignal[] = [];
  try {
    researched = await researchCandidates(unresolved);
  } catch {
    researched = unresolved.map((candidate) => ({
      subject: candidate.subject,
      status: "unclear",
      evidenceSummary: "Current status could not be verified automatically. Do not recommend this topic without checking it first.",
      sourceUrl: null,
    }));
  }
  if (researched.length) saveContextSignals(brandId, researched);
  const combined: ContextSignal[] = [...cached, ...researched];
  return [...new Map(combined.map((signal) => [normalizeContextSubject(signal.subject), signal])).values()];
}
