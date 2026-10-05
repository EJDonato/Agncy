import { ThinkingLevel, Type, type Schema } from "@google/genai";
import { z } from "zod";
import { getPastContentContext } from "./content-strategist";
import { geminiFailureLog, summarizeGeminiFailures } from "./gemini-availability";
import { getGeminiClient } from "./gemini";
import { ANTIGRAVITY_AGENT, GEMINI_IDEA_MODELS } from "./models";
import type { ContentIdea } from "./schemas";
import type { VelaChatTurn } from "@/lib/ideas/vela-chat-contract";

const VelaReplySchema = z.object({ reply: z.string().trim().min(1).max(2_000) });
const VelaReplyGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: { reply: { type: Type.STRING } },
  required: ["reply"],
};
const VelaReplyJsonSchema = {
  type: "object",
  properties: { reply: { type: "string" } },
  required: ["reply"],
};

interface VelaContext {
  brandId: string;
  creatorName: string;
  niche: string;
  targetAudience: string;
  recentTurns: VelaChatTurn[];
}

export class VelaAvailabilityError extends Error {
  constructor(
    public readonly kind: "quota_exhausted" | "unavailable",
    public readonly retryAfterSeconds: number | null,
    message: string,
  ) {
    super(message);
    this.name = "VelaAvailabilityError";
  }
}

export function isIdeaGenerationRequest(message: string): boolean {
  return [
    /\b(generate|create|give|suggest|brainstorm|make|propose|need|want)\b.{0,60}\b(ideas?|topics?|angles?|concepts?)\b/i,
    /\b(content|video|reel|post)\s+ideas?\b/i,
    /\bideas?\s+(for|about|on|around)\b/i,
    /\bmore\s+(ideas?|topics?|angles?)\b/i,
    /\bmore\s+like\b/i,
  ].some((pattern) => pattern.test(message));
}

export function generatedIdeasReply(generated: ContentIdea[]): string {
  const highlights = generated.slice(0, 3)
    .map((idea) => `- **${idea.topic}** — ${idea.angleHook}`)
    .join("\n");
  const label = generated.length === 1 ? "content idea" : "content ideas";
  return `I created **${generated.length} ${label}** and added them to your board.\n\n${highlights}\n\nOpen any card to refine the title and hook before finalizing it.`;
}

function conversationText(turns: VelaChatTurn[]): string {
  if (!turns.length) return "No earlier conversation.";
  return turns.map((turn) => `Creator: ${turn.userMessage}\nVela: ${turn.assistantMessage}`).join("\n\n");
}

export async function converseWithVela(message: string, context: VelaContext): Promise<string> {
  const systemInstruction = `You are Vela, ${context.creatorName}'s Content Strategist inside Agncy.
Be concise, perceptive, practical, and collaborative. Help sharpen topics, hooks, audience tension, and content positioning.
The creator's niche is ${context.niche}; the target audience is ${context.targetAudience}.
Do not claim to have performed live trend research or invent current facts, sources, or performance data.
Use readable Markdown when useful: bold key points, bullets, and paragraph breaks. Do not use raw HTML.
Keep the reply under 140 words and return only JSON: {"reply":"your answer"}.`;
  const prompt = `PAST CONTENT CONTEXT:
${getPastContentContext(context.brandId)}

RECENT CONVERSATION:
${conversationText(context.recentTurns)}

NEW CREATOR MESSAGE:
${message}`;
  const ai = getGeminiClient();
  const failures: unknown[] = [];

  for (const model of GEMINI_IDEA_MODELS) {
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
          ...(!isGemma && { systemInstruction, responseSchema: VelaReplyGeminiSchema }),
        },
      });
      if (response.text) return VelaReplySchema.parse(JSON.parse(response.text)).reply;
    } catch (error) {
      failures.push(error);
      console.warn("Vela model attempt failed", { model, ...geminiFailureLog(error) });
    }
  }

  try {
    const interaction = await ai.interactions.create({
      agent: ANTIGRAVITY_AGENT,
      input: `${systemInstruction}\n\n${prompt}`,
      environment: "remote",
      agent_config: { type: "antigravity", model: "gemini-3.8-flash", max_total_tokens: "4000" },
      response_format: { type: "text", mime_type: "application/json", schema: VelaReplyJsonSchema },
    }, { timeout: 120_000 });
    if (interaction.output_text) return VelaReplySchema.parse(JSON.parse(interaction.output_text)).reply;
  } catch (error) {
    failures.push(error);
    console.warn("Vela agent attempt failed", { agent: ANTIGRAVITY_AGENT, ...geminiFailureLog(error) });
  }

  const summary = summarizeGeminiFailures(failures);
  if (summary.hasQuotaFailure) throw new VelaAvailabilityError("quota_exhausted", summary.retryAfterSeconds, "Vela's quota is exhausted.");
  throw new VelaAvailabilityError("unavailable", null, "Vela is temporarily unavailable.");
}
