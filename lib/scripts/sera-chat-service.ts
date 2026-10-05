import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { SeraAvailabilityError, converseWithSera } from "@/lib/ai/sera-chat";
import { db } from "@/lib/db";
import { scripts, scriptVersions, seraChatTurns } from "@/lib/db/schema";
import { getRecentSeraChatTurns } from "@/lib/db/queries/sera-chat";
import type { SendSeraMessage, SeraChatResult } from "./sera-chat-contract";

export type SeraErrorCode = "not_found" | "conflict" | "quota_exhausted" | "unavailable" | "not_configured" | "unknown";

export class SeraServiceError extends Error {
  constructor(
    public readonly code: SeraErrorCode,
    public readonly httpStatus: number,
    message: string,
    public readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "SeraServiceError";
  }
}

function retryTime(seconds: number): string {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.ceil((seconds % 3_600) / 60);
  return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""].filter(Boolean).join(" ");
}

export function toSeraServiceError(error: unknown): SeraServiceError {
  if (error instanceof SeraServiceError) return error;
  if (error instanceof SeraAvailabilityError && error.kind === "quota_exhausted") {
    const reset = error.retryAfterSeconds ? ` in about ${retryTime(error.retryAfterSeconds)}` : " later";
    const fallback = error.message.includes("fallback") ? " Fallback models are also busy, but you can retry sooner." : "";
    return new SeraServiceError(
      "quota_exhausted",
      429,
      `Gemini's primary quota resets${reset}.${fallback} Your message is still available to retry.`,
      error.retryAfterSeconds,
    );
  }
  if (error instanceof SeraAvailabilityError) {
    return new SeraServiceError("unavailable", 503, "Sera is temporarily busy. Your message is still available to retry.");
  }
  if (error instanceof Error) {
    if (error.message.includes("GEMINI_API_KEY")) {
      return new SeraServiceError("not_configured", 503, "Sera is not connected. Add your Gemini API key and try again.");
    }
    if (/too long|timed out/i.test(error.message)) {
      return new SeraServiceError("unavailable", 503, "Sera took too long to respond. Your message is still available to retry.");
    }
    if (error.message.startsWith("Set up your Brand Brain")) {
      return new SeraServiceError("not_configured", 409, error.message);
    }
  }
  return new SeraServiceError("unknown", 500, "Sera could not respond right now. Your script was not changed.");
}

function completedResult(row: typeof seraChatTurns.$inferSelect): SeraChatResult | null {
  if (row.status !== "completed" || !row.assistantMessage || !row.action) return null;
  const revision = row.revisionVersionId
    ? db.select().from(scriptVersions).where(eq(scriptVersions.id, row.revisionVersionId)).get()
    : null;
  return {
    turn: {
      id: row.id,
      userMessage: row.userMessage,
      assistantMessage: row.assistantMessage,
      action: row.action,
      revisionVersionId: row.revisionVersionId,
      createdAt: row.createdAt,
    },
    revisedContent: revision?.fullContent ?? null,
    versionNumber: revision?.versionNumber ?? null,
  };
}

export async function sendSeraMessage(input: SendSeraMessage): Promise<SeraChatResult> {
  const script = db.select().from(scripts).where(eq(scripts.id, input.scriptId)).get();
  if (!script) throw new SeraServiceError("not_found", 404, "Script not found.");

  const existing = db.select().from(seraChatTurns).where(eq(seraChatTurns.id, input.requestId)).get();
  const priorResult = existing ? completedResult(existing) : null;
  if (priorResult) return priorResult;
  if (existing) throw new SeraServiceError("conflict", 409, "Sera is already handling this message. Please wait.");

  const createdAt = new Date().toISOString();
  db.insert(seraChatTurns).values({
    id: input.requestId,
    scriptId: input.scriptId,
    userMessage: input.message,
    status: "running",
    createdAt,
  }).run();

  try {
    const response = await converseWithSera({
      currentContent: input.currentContent,
      message: input.message,
      recentTurns: getRecentSeraChatTurns(input.scriptId),
    });
    let revisionVersionId: string | null = null;
    let versionNumber: number | null = null;
    const completedAt = new Date().toISOString();

    db.transaction((tx) => {
      if (response.revisedContent) {
        const latest = tx.select({ versionNumber: scriptVersions.versionNumber }).from(scriptVersions)
          .where(eq(scriptVersions.scriptId, input.scriptId)).orderBy(desc(scriptVersions.versionNumber)).limit(1).get();
        versionNumber = (latest?.versionNumber ?? 0) + 1;
        revisionVersionId = `ver_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        tx.insert(scriptVersions).values({
          id: revisionVersionId,
          scriptId: input.scriptId,
          versionNumber,
          versionType: "ai_revision",
          fullContent: response.revisedContent,
        }).run();
        tx.update(scripts).set({ status: "drafting", updatedAt: completedAt })
          .where(eq(scripts.id, input.scriptId)).run();
      }
      tx.update(seraChatTurns).set({
        assistantMessage: response.reply,
        action: response.action,
        status: "completed",
        revisionVersionId,
        errorMessage: null,
        completedAt,
      }).where(eq(seraChatTurns.id, input.requestId)).run();
    });

    return {
      turn: {
        id: input.requestId,
        userMessage: input.message,
        assistantMessage: response.reply,
        action: response.action,
        revisionVersionId,
        createdAt,
      },
      revisedContent: response.revisedContent,
      versionNumber,
    };
  } catch (error) {
    const failure = toSeraServiceError(error);
    console.error("Sera conversation failed", { scriptId: input.scriptId, requestId: input.requestId, code: failure.code });
    db.update(seraChatTurns).set({ status: "failed", errorMessage: failure.message, completedAt: new Date().toISOString() })
      .where(eq(seraChatTurns.id, input.requestId)).run();
    throw failure;
  }
}
