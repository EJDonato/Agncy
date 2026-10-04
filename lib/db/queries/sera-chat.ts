import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { seraChatTurns } from "@/lib/db/schema";
import type { SeraChatTurn } from "@/lib/ai/sera-chat-contract";

const CONTEXT_TURN_LIMIT = 10;

function toChatTurn(row: typeof seraChatTurns.$inferSelect): SeraChatTurn | null {
  if (!row.assistantMessage || !row.action) return null;
  return {
    id: row.id,
    userMessage: row.userMessage,
    assistantMessage: row.assistantMessage,
    action: row.action,
    revisionVersionId: row.revisionVersionId,
    createdAt: row.createdAt,
  };
}

export function getSeraChatTurns(scriptId: string): SeraChatTurn[] {
  return db.select().from(seraChatTurns)
    .where(and(eq(seraChatTurns.scriptId, scriptId), eq(seraChatTurns.status, "completed")))
    .orderBy(asc(seraChatTurns.createdAt))
    .all()
    .map(toChatTurn)
    .filter((turn): turn is SeraChatTurn => turn !== null);
}

export function getRecentSeraChatTurns(scriptId: string): SeraChatTurn[] {
  return db.select().from(seraChatTurns)
    .where(and(eq(seraChatTurns.scriptId, scriptId), eq(seraChatTurns.status, "completed")))
    .orderBy(desc(seraChatTurns.createdAt))
    .limit(CONTEXT_TURN_LIMIT)
    .all()
    .reverse()
    .map(toChatTurn)
    .filter((turn): turn is SeraChatTurn => turn !== null);
}
