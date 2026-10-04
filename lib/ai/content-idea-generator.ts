import { getGeminiClient } from "./gemini";
import { GEMINI_IDEA_MODELS } from "./models";
import { ContentIdeasGeminiSchema, ContentIdeasResponseSchema, type ContentIdea } from "./schemas";

const IDEA_GENERATION_TIMEOUT_MS = 90_000;

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
  let lastError: unknown;

  for (const model of GEMINI_IDEA_MODELS) {
    try {
      const response = await withTimeout(ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: ContentIdeasGeminiSchema,
        },
      }), IDEA_GENERATION_TIMEOUT_MS);
      if (response.text) {
        return ContentIdeasResponseSchema.parse(JSON.parse(response.text)).ideas;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed to generate content ideas:`, error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini could not generate content ideas.");
}
