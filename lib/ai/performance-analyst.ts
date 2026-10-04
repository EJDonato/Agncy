import { getGeminiClient } from "./gemini";
import { GEMINI_ANALYST_MODELS } from "./models";
import { PerformanceAnalysisGeminiSchema, PerformanceAnalysisSchema, type PerformanceAnalysis } from "./schemas";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";

function titleFor(post: PostWithLatestMetrics): string {
  return (post.normalizedTitle || post.rawTitle || "Untitled post").slice(0, 500);
}

function postData(posts: PostWithLatestMetrics[]): string {
  return posts.slice(0, 40).map((post, index) => JSON.stringify({
    post: index + 1,
    title: titleFor(post),
    format: post.postType || "Uncategorized",
    views: post.views,
    interactions: post.interactions,
    shares: post.shares,
    saves: post.saves,
    avgSecondsViewed: post.avgSecondsViewed,
    durationSeconds: post.durationSeconds,
  })).join("\n");
}

export async function analyzePerformanceWithGemini(posts: PostWithLatestMetrics[]): Promise<PerformanceAnalysis> {
  if (posts.length < 2) throw new Error("Import at least two posts before running an AI performance analysis.");

  const prompt = `You are the Performance Analyst for a creator's content studio. Analyze only the supplied post dataset. Find semantic similarities across titles, hooks, themes, formats, and measurable outcomes. Give practical, testable next steps.

Strict rules:
- Treat associations as observed patterns, never as proven causation.
- Do not claim access to retention, audience demographics, or data not supplied.
- Cite supplied post titles, formats, or metrics in each evidence field.
- If evidence is thin or mixed, say so in the caveat.
- Recommendations must be concrete experiments for the next content ideas.

Posts, newest first:
${postData(posts)}

Return only JSON matching the requested schema.`;

  const ai = getGeminiClient();
  let responseText = "";
  let lastError: unknown = null;
  for (const model of GEMINI_ANALYST_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: PerformanceAnalysisGeminiSchema },
      });
      if (response.text) {
        responseText = response.text;
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (!responseText) throw lastError instanceof Error ? lastError : new Error("Gemini could not analyze performance right now.");
  return PerformanceAnalysisSchema.parse(JSON.parse(responseText));
}
