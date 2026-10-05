import { ThinkingLevel } from "@google/genai";
import { geminiFailureLog, summarizeGeminiFailures } from "./gemini-availability";
import { getGeminiClient } from "./gemini";
import { ANTIGRAVITY_AGENT, GEMINI_IDEA_MODELS } from "./models";
import { ContentIdeasGeminiSchema, ContentIdeasResponseSchema, type ContentIdea } from "./schemas";

const IDEA_GENERATION_TIMEOUT_MS = 90_000;
const GEMMA_IDEA_GENERATION_TIMEOUT_MS = 120_000;
const CONTENT_IDEAS_JSON_INSTRUCTION = `Return only JSON with this exact shape:
{"ideas":[{"topic":"string","angleHook":"string","whySuggested":"string","predictedFitScore":0.88}]}`;
const ContentIdeasJsonSchema = {
  type: "object",
  properties: {
    ideas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          angleHook: { type: "string" },
          whySuggested: { type: "string" },
          predictedFitScore: { type: "number" },
        },
        required: ["topic", "angleHook", "whySuggested", "predictedFitScore"],
      },
    },
  },
  required: ["ideas"],
};

export class ContentIdeaAvailabilityError extends Error {
  constructor(
    public readonly kind: "quota_exhausted" | "unavailable",
    public readonly retryAfterSeconds: number | null,
    message: string,
  ) {
    super(message);
    this.name = "ContentIdeaAvailabilityError";
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Content idea generation timed out.")), timeoutMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function generateStructuredContentIdeas(prompt: string): Promise<ContentIdea[]> {
  const ai = getGeminiClient();
  const failures: unknown[] = [];

  for (const model of GEMINI_IDEA_MODELS) {
    try {
      const isGemma = model.startsWith("gemma-");
      const timeoutMs = isGemma ? GEMMA_IDEA_GENERATION_TIMEOUT_MS : IDEA_GENERATION_TIMEOUT_MS;
      const response = await withTimeout(ai.models.generateContent({
        model,
        contents: isGemma ? `${prompt}\n\n${CONTENT_IDEAS_JSON_INSTRUCTION}` : prompt,
        config: {
          httpOptions: { timeout: timeoutMs },
          maxOutputTokens: 4_096,
          thinkingConfig: { thinkingLevel: isGemma ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW },
          responseMimeType: "application/json",
          ...(!isGemma && { responseSchema: ContentIdeasGeminiSchema }),
        },
      }), timeoutMs);
      if (response.text) {
        return ContentIdeasResponseSchema.parse(JSON.parse(response.text)).ideas;
      }
    } catch (error) {
      failures.push(error);
      console.warn("Content idea model attempt failed", { model, ...geminiFailureLog(error) });
    }
  }

  try {
    const interaction = await ai.interactions.create({
      agent: ANTIGRAVITY_AGENT,
      input: `${prompt}\n\n${CONTENT_IDEAS_JSON_INSTRUCTION}`,
      environment: "remote",
      agent_config: { type: "antigravity", model: "gemini-3.8-flash", max_total_tokens: "8000" },
      response_format: { type: "text", mime_type: "application/json", schema: ContentIdeasJsonSchema },
    }, { timeout: GEMMA_IDEA_GENERATION_TIMEOUT_MS });
    if (interaction.output_text) {
      return ContentIdeasResponseSchema.parse(JSON.parse(interaction.output_text)).ideas;
    }
  } catch (error) {
    failures.push(error);
    console.warn("Content idea agent attempt failed", { agent: ANTIGRAVITY_AGENT, ...geminiFailureLog(error) });
  }

  const summary = summarizeGeminiFailures(failures);
  if (summary.hasQuotaFailure) {
    throw new ContentIdeaAvailabilityError(
      "quota_exhausted",
      summary.retryAfterSeconds,
      summary.hasUnavailableFailure
        ? "Content idea models are currently at quota or busy. Try again later."
        : "Content idea generation quota is exhausted. Try again later.",
    );
  }
  throw new ContentIdeaAvailabilityError("unavailable", null, "Content idea generation is temporarily unavailable.");
}
