import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { ContentIdeaAvailabilityError } from "@/lib/ai/content-idea-generator";
import { generateContentIdeas } from "@/lib/ai/content-strategist";
import { converseWithVela, generatedIdeasReply, isIdeaGenerationRequest, VelaAvailabilityError } from "@/lib/ai/vela-chat";
import { db } from "@/lib/db";
import { brandProfiles, ideas, velaChatTurns } from "@/lib/db/schema";
import { getRecentVelaChatTurns, getVelaChatTurns } from "@/lib/db/queries/vela-chat";
import type { ContentIdea } from "@/lib/ai/schemas";
import type { SendVelaMessage, VelaChatTurn } from "./vela-chat-contract";

export type VelaErrorCode = "conflict" | "quota_exhausted" | "unavailable" | "not_configured" | "unknown";

export class VelaServiceError extends Error {
  constructor(
    public readonly code: VelaErrorCode,
    public readonly httpStatus: number,
    message: string,
    public readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "VelaServiceError";
  }
}

function retryTime(seconds: number): string {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.ceil((seconds % 3_600) / 60);
  return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""].filter(Boolean).join(" ");
}

export function toVelaServiceError(error: unknown): VelaServiceError {
  if (error instanceof VelaServiceError) return error;
  if ((error instanceof VelaAvailabilityError || error instanceof ContentIdeaAvailabilityError) && error.kind === "quota_exhausted") {
    const reset = error.retryAfterSeconds ? ` Try again in about ${retryTime(error.retryAfterSeconds)}.` : " Try again later.";
    return new VelaServiceError("quota_exhausted", 429, `Gemini's quota is exhausted.${reset} Your message is ready to retry.`, error.retryAfterSeconds);
  }
  if (error instanceof VelaAvailabilityError || error instanceof ContentIdeaAvailabilityError || (error instanceof Error && /timed out/i.test(error.message))) {
    return new VelaServiceError("unavailable", 503, "Vela is temporarily busy. Your message is ready to retry.");
  }
  if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
    return new VelaServiceError("not_configured", 503, "Vela is not connected. Add your Gemini API key and try again.");
  }
  return new VelaServiceError("unknown", 500, "Vela could not respond right now.");
}

function profileOrThrow() {
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new VelaServiceError("not_configured", 409, "Set up your Brand Brain before talking with Vela.");
  return profile;
}

function toTurn(row: typeof velaChatTurns.$inferSelect): VelaChatTurn {
  if (!row.assistantMessage || !row.action) throw new VelaServiceError("conflict", 409, "Vela is already handling this message. Please wait.");
  return {
    id: row.id,
    userMessage: row.userMessage,
    assistantMessage: row.assistantMessage,
    action: row.action,
    generatedIdeaCount: row.generatedIdeaCount,
    createdAt: row.createdAt,
  };
}

function generationBrief(message: string, turns: VelaChatTurn[]): string {
  const context = turns.slice(-4).map((turn) => `Creator: ${turn.userMessage}\nVela: ${turn.assistantMessage}`).join("\n\n");
  return context ? `${message}\n\nUse this recent conversation only to resolve follow-up references:\n${context}` : message;
}

function saveGeneratedIdeas(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], brandId: string, generated: ContentIdea[]) {
  for (const idea of generated) {
    tx.insert(ideas).values({
      id: `idea_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      brandId,
      topic: idea.topic,
      angleHook: idea.angleHook,
      whySuggested: idea.whySuggested,
      predictedFitScore: idea.predictedFitScore,
      status: "suggested",
    }).run();
  }
}

export function loadVelaChat(): VelaChatTurn[] {
  return getVelaChatTurns(profileOrThrow().id);
}

export async function sendVelaMessage(input: SendVelaMessage): Promise<VelaChatTurn> {
  const profile = profileOrThrow();
  const existing = db.select().from(velaChatTurns).where(eq(velaChatTurns.id, input.requestId)).get();
  if (existing?.status === "completed") return toTurn(existing);
  if (existing) throw new VelaServiceError("conflict", 409, "Vela is already handling this message. Please wait.");

  const createdAt = new Date().toISOString();
  db.insert(velaChatTurns).values({ id: input.requestId, brandId: profile.id, userMessage: input.message, status: "running", createdAt }).run();
  try {
    const recentTurns = getRecentVelaChatTurns(profile.id);
    const action = isIdeaGenerationRequest(input.message) ? "generate" : "discuss";
    const generated = action === "generate"
      ? await generateContentIdeas({ brandId: profile.id, prompt: generationBrief(input.message, recentTurns) })
      : [];
    const assistantMessage = action === "generate"
      ? generatedIdeasReply(generated)
      : await converseWithVela(input.message, {
        brandId: profile.id,
        creatorName: profile.creatorName,
        niche: profile.niche,
        targetAudience: profile.targetAudience,
        recentTurns,
      });
    const completedAt = new Date().toISOString();
    db.transaction((tx) => {
      saveGeneratedIdeas(tx, profile.id, generated);
      tx.update(velaChatTurns).set({ action, assistantMessage, generatedIdeaCount: generated.length, status: "completed", errorMessage: null, completedAt })
        .where(eq(velaChatTurns.id, input.requestId)).run();
    });
    return { id: input.requestId, userMessage: input.message, assistantMessage, action, generatedIdeaCount: generated.length, createdAt };
  } catch (error) {
    const failure = toVelaServiceError(error);
    console.error("Vela conversation failed", { requestId: input.requestId, code: failure.code });
    db.update(velaChatTurns).set({ status: "failed", errorMessage: failure.message, completedAt: new Date().toISOString() })
      .where(eq(velaChatTurns.id, input.requestId)).run();
    throw failure;
  }
}
