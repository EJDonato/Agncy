import { ThinkingLevel, Type, type Schema } from "@google/genai";
import { z } from "zod";
import { PerformanceAnalysisSchema } from "./performance-analysis-schema";
import { geminiFailureLog, summarizeGeminiFailures } from "./gemini-availability";
import { getGeminiClient } from "./gemini";
import { ANTIGRAVITY_AGENT, GEMINI_AXIOM_CHAT_MODELS } from "./models";
import { getFreshContextSignals } from "@/lib/db/queries/context-signals";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import type { AxiomChatTurn } from "@/lib/analytics/axiom-chat-contract";
import type { PerformanceAnalysisJob } from "@/lib/analytics/performance-analysis-contract";

const AxiomReplySchema = z.object({ reply: z.string().trim().min(1).max(2_000) });
const AxiomReplyGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: { reply: { type: Type.STRING } },
  required: ["reply"],
};
const AxiomReplyJsonSchema = {
  type: "object",
  properties: { reply: { type: "string" } },
  required: ["reply"],
};

interface AxiomContext {
  brandId: string;
  creatorName: string;
  niche: string;
  targetAudience: string;
  latestAnalysis: PerformanceAnalysisJob | null;
  recentTurns: AxiomChatTurn[];
}

export class AxiomAvailabilityError extends Error {
  constructor(
    public readonly kind: "quota_exhausted" | "unavailable",
    public readonly retryAfterSeconds: number | null,
    message: string,
  ) {
    super(message);
    this.name = "AxiomAvailabilityError";
  }
}

function conversationText(turns: AxiomChatTurn[]): string {
  if (!turns.length) return "No earlier conversation.";
  return turns.map((turn) => `Creator: ${turn.userMessage}\nAxiom: ${turn.assistantMessage}`).join("\n\n");
}

export async function converseWithAxiom(message: string, context: AxiomContext): Promise<string> {
  const posts = await getPostsWithLatestMetrics();
  if (!posts.length) throw new Error("Import a Meta CSV before asking Axiom about performance.");
  const signals = getFreshContextSignals(context.brandId);
  const analysis = context.latestAnalysis?.status === "completed"
    ? PerformanceAnalysisSchema.safeParse(context.latestAnalysis.analysis).data ?? null
    : null;
  const postData = posts.slice(0, 40).map((post, index) => JSON.stringify({
    post: index + 1,
    title: post.normalizedTitle || post.rawTitle || "Untitled post",
    publishedAt: post.publishedAt,
    format: post.postType || "Uncategorized",
    views: post.views,
    impressions: post.impressions,
    interactions: post.interactions,
    comments: post.comments,
    shares: post.shares,
    saves: post.saves,
    avgSecondsViewed: post.avgSecondsViewed,
    durationSeconds: post.durationSeconds,
  })).join("\n");

  const systemInstruction = `You are Axiom, ${context.creatorName}'s performance analyst inside Agncy.
Be concise, analytical, candid, and practical. Answer only from the supplied data.
Never invent retention curves, demographics, causation, or metrics that are absent.
Name the post titles and metrics supporting a conclusion. Separate observed patterns from hypotheses.
The creator's niche is ${context.niche}; the target audience is ${context.targetAudience}.
Do not present expired or unclear time-sensitive opportunities as active.
Use readable Markdown inside the reply string when useful: bold key findings, short headings, bullets, and paragraph breaks.
Do not over-format, nest lists, or use raw HTML.
Keep the reply under 180 words and return only JSON: {"reply":"your answer"}.`;

  const prompt = `LATEST SAVED ANALYSIS:
${analysis ? JSON.stringify(analysis) : "No completed pattern analysis is available."}

VERIFIED TIME-SENSITIVE CONTEXT:
${signals.length ? signals.map((signal) => `- ${signal.subject}: ${signal.status}. ${signal.evidenceSummary}`).join("\n") : "No saved freshness signals."}

RECENT CONVERSATION:
${conversationText(context.recentTurns)}

POST DATA, NEWEST FIRST:
${postData}

NEW CREATOR QUESTION:
${message}`;

  const ai = getGeminiClient();
  const failures: unknown[] = [];
  for (const model of GEMINI_AXIOM_CHAT_MODELS) {
    try {
      const isGemma = model.startsWith("gemma-");
      const response = await ai.models.generateContent({
        model,
        contents: isGemma ? `${systemInstruction}\n\n${prompt}` : prompt,
        config: {
          httpOptions: { timeout: isGemma ? 120_000 : 60_000 },
          maxOutputTokens: 768,
          thinkingConfig: { thinkingLevel: isGemma ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW },
          responseMimeType: "application/json",
          ...(!isGemma && { systemInstruction, responseSchema: AxiomReplyGeminiSchema }),
        },
      });
      if (response.text) return AxiomReplySchema.parse(JSON.parse(response.text)).reply;
    } catch (error) {
      failures.push(error);
      console.warn("Axiom model attempt failed", { model, ...geminiFailureLog(error) });
    }
  }
  try {
    const interaction = await ai.interactions.create({
      agent: ANTIGRAVITY_AGENT,
      input: `${systemInstruction}\n\n${prompt}`,
      environment: "remote",
      agent_config: { type: "antigravity", model: "gemini-3.8-flash", max_total_tokens: "4000" },
      response_format: { type: "text", mime_type: "application/json", schema: AxiomReplyJsonSchema },
    }, { timeout: 120_000 });
    if (interaction.output_text) return AxiomReplySchema.parse(JSON.parse(interaction.output_text)).reply;
  } catch (error) {
    failures.push(error);
    console.warn("Axiom agent attempt failed", { agent: ANTIGRAVITY_AGENT, ...geminiFailureLog(error) });
  }
  const summary = summarizeGeminiFailures(failures);
  if (summary.hasQuotaFailure) {
    throw new AxiomAvailabilityError("quota_exhausted", summary.retryAfterSeconds, "Gemini quota is exhausted.");
  }
  throw new AxiomAvailabilityError("unavailable", null, "Axiom is temporarily unavailable.");
}
