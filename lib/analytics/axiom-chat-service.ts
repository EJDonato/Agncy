import { eq } from "drizzle-orm";
import { AxiomAvailabilityError, converseWithAxiom } from "@/lib/ai/axiom-chat";
import { getLatestPerformanceAnalysisJob } from "./performance-analysis-jobs";
import { db } from "@/lib/db";
import { axiomChatTurns, brandProfiles } from "@/lib/db/schema";
import { getAxiomChatTurns, getRecentAxiomChatTurns } from "@/lib/db/queries/axiom-chat";
import type { AxiomChatTurn, SendAxiomMessage } from "./axiom-chat-contract";

export type AxiomErrorCode = "conflict" | "quota_exhausted" | "unavailable" | "not_configured" | "unknown";

export class AxiomServiceError extends Error {
  constructor(
    public readonly code: AxiomErrorCode,
    public readonly httpStatus: number,
    message: string,
    public readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "AxiomServiceError";
  }
}

function retryTime(seconds: number): string {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.ceil((seconds % 3_600) / 60);
  return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""].filter(Boolean).join(" ");
}

export function toAxiomServiceError(error: unknown): AxiomServiceError {
  if (error instanceof AxiomServiceError) return error;
  if (error instanceof AxiomAvailabilityError && error.kind === "quota_exhausted") {
    const reset = error.retryAfterSeconds ? ` Try again in about ${retryTime(error.retryAfterSeconds)}.` : " Try again later.";
    return new AxiomServiceError("quota_exhausted", 429, `Gemini's quota is exhausted.${reset} Your question is still available to retry.`, error.retryAfterSeconds);
  }
  if (error instanceof AxiomAvailabilityError || (error instanceof Error && /timed out|too long/i.test(error.message))) {
    return new AxiomServiceError("unavailable", 503, "Axiom is temporarily busy. Your question is still available to retry.");
  }
  if (error instanceof Error) {
    if (error.message.includes("GEMINI_API_KEY")) return new AxiomServiceError("not_configured", 503, "Axiom is not connected. Add your Gemini API key and try again.");
    if (error.message.startsWith("Import a Meta CSV")) return new AxiomServiceError("not_configured", 409, error.message);
  }
  return new AxiomServiceError("unknown", 500, "Axiom could not respond right now.");
}

function profileOrThrow() {
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new AxiomServiceError("not_configured", 409, "Set up your Brand Brain before talking with Axiom.");
  return profile;
}

export function loadAxiomChat(): AxiomChatTurn[] {
  return getAxiomChatTurns(profileOrThrow().id);
}

export async function sendAxiomMessage(input: SendAxiomMessage): Promise<AxiomChatTurn> {
  const profile = profileOrThrow();
  const existing = db.select().from(axiomChatTurns).where(eq(axiomChatTurns.id, input.requestId)).get();
  if (existing?.status === "completed" && existing.assistantMessage) {
    return { id: existing.id, userMessage: existing.userMessage, assistantMessage: existing.assistantMessage, createdAt: existing.createdAt };
  }
  if (existing) throw new AxiomServiceError("conflict", 409, "Axiom is already handling this question. Please wait.");

  const createdAt = new Date().toISOString();
  db.insert(axiomChatTurns).values({ id: input.requestId, brandId: profile.id, userMessage: input.message, status: "running", createdAt }).run();
  try {
    const assistantMessage = await converseWithAxiom(input.message, {
      brandId: profile.id,
      creatorName: profile.creatorName,
      niche: profile.niche,
      targetAudience: profile.targetAudience,
      latestAnalysis: getLatestPerformanceAnalysisJob(),
      recentTurns: getRecentAxiomChatTurns(profile.id),
    });
    db.update(axiomChatTurns).set({ status: "completed", assistantMessage, errorMessage: null, completedAt: new Date().toISOString() })
      .where(eq(axiomChatTurns.id, input.requestId)).run();
    return { id: input.requestId, userMessage: input.message, assistantMessage, createdAt };
  } catch (error) {
    const failure = toAxiomServiceError(error);
    console.error("Axiom conversation failed", { requestId: input.requestId, code: failure.code });
    db.update(axiomChatTurns).set({ status: "failed", errorMessage: failure.message, completedAt: new Date().toISOString() })
      .where(eq(axiomChatTurns.id, input.requestId)).run();
    throw failure;
  }
}
