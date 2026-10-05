import { z } from "zod";

export const SendAxiomMessageSchema = z.object({
  requestId: z.string().uuid(),
  message: z.string().trim().min(1, "Write a message for Axiom").max(1_500),
});

export const AxiomChatTurnSchema = z.object({
  id: z.string().min(1),
  userMessage: z.string(),
  assistantMessage: z.string(),
  createdAt: z.string().min(1),
});

const AxiomErrorSchema = z.object({
  code: z.enum(["invalid_request", "conflict", "quota_exhausted", "unavailable", "not_configured", "unknown"]),
  message: z.string().min(1),
  retryAfterSeconds: z.number().int().positive().nullable(),
});

export const AxiomHistoryResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), turns: z.array(AxiomChatTurnSchema) }),
  z.object({ success: z.literal(false), error: AxiomErrorSchema }),
]);

export const AxiomMessageResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), turn: AxiomChatTurnSchema }),
  z.object({ success: z.literal(false), error: AxiomErrorSchema }),
]);

export type SendAxiomMessage = z.infer<typeof SendAxiomMessageSchema>;
export type AxiomChatTurn = z.infer<typeof AxiomChatTurnSchema>;
