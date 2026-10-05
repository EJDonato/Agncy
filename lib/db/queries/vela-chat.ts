import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { velaChatTurns } from "@/lib/db/schema";
import type { VelaChatTurn } from "@/lib/ideas/vela-chat-contract";

const CONTEXT_TURN_LIMIT = 10;

function toTurn(row: typeof velaChatTurns.$inferSelect): VelaChatTurn | null {
  if (!row.assistantMessage || !row.action) return null;
  return {
    id: row.id,
    userMessage: row.userMessage,
    assistantMessage: row.assistantMessage,
    action: row.action,
    generatedIdeaCount: row.generatedIdeaCount,
    createdAt: row.createdAt,
  };
}

function completedForBrand(brandId: string) {
  return and(eq(velaChatTurns.brandId, brandId), eq(velaChatTurns.status, "completed"));
}

export function getVelaChatTurns(brandId: string): VelaChatTurn[] {
  return db.select().from(velaChatTurns).where(completedForBrand(brandId))
    .orderBy(asc(velaChatTurns.createdAt)).all().map(toTurn)
    .filter((turn): turn is VelaChatTurn => turn !== null);
}

export function getRecentVelaChatTurns(brandId: string): VelaChatTurn[] {
  return db.select().from(velaChatTurns).where(completedForBrand(brandId))
    .orderBy(desc(velaChatTurns.createdAt)).limit(CONTEXT_TURN_LIMIT).all().reverse().map(toTurn)
    .filter((turn): turn is VelaChatTurn => turn !== null);
}
