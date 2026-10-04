import { getGeminiClient } from "./gemini";
import { GEMINI_ANALYST_MODELS } from "./models";
import { PerformanceAnalysisGeminiSchema, PerformanceAnalysisSchema, type PerformanceAnalysis } from "./schemas";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";

export interface PerformanceCreatorContext {
  creatorName: string;
  niche: string;
  targetAudience: string;
  toneOfVoice: string;
  currentConstraints?: string;
}

function titleFor(post: PostWithLatestMetrics): string {
  return (post.normalizedTitle || post.rawTitle || "Untitled post").slice(0, 500);
}

function postData(posts: PostWithLatestMetrics[]): string {
  return posts.slice(0, 40).map((post, index) => JSON.stringify({
    post: index + 1,
    title: titleFor(post),
    publishedAt: post.publishedAt,
    format: post.postType || "Uncategorized",
    views: post.views,
    interactions: post.interactions,
    shares: post.shares,
    saves: post.saves,
    avgSecondsViewed: post.avgSecondsViewed,
    durationSeconds: post.durationSeconds,
  })).join("\n");
}

export async function analyzePerformanceWithGemini(posts: PostWithLatestMetrics[], context: PerformanceCreatorContext): Promise<PerformanceAnalysis> {
  if (posts.length < 2) throw new Error("Import at least two posts before running an AI performance analysis.");

  const prompt = `You are Axiom, the Performance Analyst for ${context.creatorName}'s content studio.
Current date: ${new Date().toISOString().slice(0, 10)}
Creator niche: ${context.niche}
Target audience: ${context.targetAudience}
Brand voice: ${context.toneOfVoice}
Current creator context and constraints: ${context.currentConstraints || "No additional current constraints were supplied."}

Analyze only the supplied post dataset. Find semantic similarities across titles, hooks, themes, formats, and measurable outcomes. Give practical, testable next steps.

Strict rules:
- Treat associations as observed patterns, never as proven causation.
- Do not claim access to retention, audience demographics, or data not supplied.
- Cite supplied post titles, formats, or metrics in each evidence field.
- If evidence is thin or mixed, say so in the caveat.
- Recommendations must be concrete experiments for the next content ideas.
- Separate the successful creative mechanism (hook, framing, utility, format, urgency, structure) from the old subject matter.
- Do not recommend repeating applications, deadlines, financial assistance, events, campaigns, or programs that may have ended. Unless the current creator context explicitly confirms they are active, generalize the reusable mechanism into an evergreen or currently actionable idea.
- Use each post's publication date to recognize that older time-sensitive topics may no longer be actionable.
- If a recommendation depends on a program still being active, say it must be verified instead of presenting it as a next experiment.

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
