import assert from "node:assert/strict";
import test from "node:test";
import { AxiomHistoryResponseSchema, AxiomMessageResponseSchema, SendAxiomMessageSchema } from "../lib/analytics/axiom-chat-contract";

test("validates an Axiom message request", () => {
  const result = SendAxiomMessageSchema.safeParse({ requestId: crypto.randomUUID(), message: "What should I test next?" });
  assert.equal(result.success, true);
});

test("accepts persisted Axiom history", () => {
  const result = AxiomHistoryResponseSchema.parse({
    success: true,
    turns: [{ id: "turn-1", userMessage: "What worked?", assistantMessage: "Utility posts led on views.", createdAt: "2026-10-05T00:00:00.000Z" }],
  });
  assert.equal(result.success && result.turns.length, 1);
});

test("accepts a structured Axiom quota error", () => {
  const result = AxiomMessageResponseSchema.parse({
    success: false,
    error: { code: "quota_exhausted", message: "Try again later.", retryAfterSeconds: 300 },
  });
  assert.equal(result.success ? null : result.error.code, "quota_exhausted");
});
