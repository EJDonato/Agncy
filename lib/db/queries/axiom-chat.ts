import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { axiomChatTurns } from "@/lib/db/schema";
import type { AxiomChatTurn } from "@/lib/analytics/axiom-chat-contract";

const CONTEXT_TURN_LIMIT = 10;

function toTurn(row: typeof axiomChatTurns.$inferSelect): AxiomChatTurn | null {
  if (!row.assistantMessage) return null;
  return {
    id: row.id,
    userMessage: row.userMessage,
    assistantMessage: row.assistantMessage,
    createdAt: row.createdAt,
  };
}

function completedForBrand(brandId: string) {
  return and(eq(axiomChatTurns.brandId, brandId), eq(axiomChatTurns.status, "completed"));
}

export function getAxiomChatTurns(brandId: string): AxiomChatTurn[] {
  return db.select().from(axiomChatTurns).where(completedForBrand(brandId))
    .orderBy(asc(axiomChatTurns.createdAt)).all().map(toTurn)
    .filter((turn): turn is AxiomChatTurn => turn !== null);
}

export function getRecentAxiomChatTurns(brandId: string): AxiomChatTurn[] {
  return db.select().from(axiomChatTurns).where(completedForBrand(brandId))
    .orderBy(desc(axiomChatTurns.createdAt)).limit(CONTEXT_TURN_LIMIT).all().reverse().map(toTurn)
    .filter((turn): turn is AxiomChatTurn => turn !== null);
}
