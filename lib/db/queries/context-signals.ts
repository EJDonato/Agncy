import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contextSignals } from "@/lib/db/schema";
import type { ContextSignal } from "@/lib/ai/context-schemas";

export type StoredContextSignal = typeof contextSignals.$inferSelect;

export function normalizeContextSubject(subject: string): string {
  return subject.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function getFreshContextSignals(brandId: string): StoredContextSignal[] {
  const now = new Date().toISOString();
  return db.select().from(contextSignals).where(eq(contextSignals.brandId, brandId)).all()
    .filter((signal) => signal.expiresAt > now);
}

function expiryFor(status: ContextSignal["status"], checkedAt: Date): string {
  const days = status === "ended" || status === "evergreen" ? 30 : status === "recurring_closed" ? 7 : 1;
  return new Date(checkedAt.getTime() + days * 86_400_000).toISOString();
}

export function saveContextSignals(brandId: string, signals: ContextSignal[]): StoredContextSignal[] {
  const checkedAt = new Date();
  db.transaction((tx) => {
    for (const signal of signals) {
      const normalizedSubject = normalizeContextSubject(signal.subject);
      tx.insert(contextSignals).values({
        id: `ctx_${crypto.randomUUID()}`,
        brandId,
        subject: signal.subject,
        normalizedSubject,
        status: signal.status,
        evidenceSummary: signal.evidenceSummary,
        sourceUrl: signal.sourceUrl,
        checkedAt: checkedAt.toISOString(),
        expiresAt: expiryFor(signal.status, checkedAt),
      }).onConflictDoUpdate({
        target: [contextSignals.brandId, contextSignals.normalizedSubject],
        set: {
          subject: signal.subject,
          status: signal.status,
          evidenceSummary: signal.evidenceSummary,
          sourceUrl: signal.sourceUrl,
          checkedAt: checkedAt.toISOString(),
          expiresAt: expiryFor(signal.status, checkedAt),
        },
      }).run();
    }
  });
  return getFreshContextSignals(brandId);
}
