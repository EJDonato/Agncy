import { z } from "zod";

export const SendVelaMessageSchema = z.object({
  requestId: z.string().uuid(),
  message: z.string().trim().min(1, "Write a message for Vela").max(1_500),
});

export const VelaChatTurnSchema = z.object({
  id: z.string().min(1),
  userMessage: z.string(),
  assistantMessage: z.string(),
  action: z.enum(["discuss", "generate"]),
  generatedIdeaCount: z.number().int().nonnegative(),
  createdAt: z.string().min(1),
});

const VelaErrorSchema = z.object({
  code: z.enum(["invalid_request", "conflict", "quota_exhausted", "unavailable", "not_configured", "unknown"]),
  message: z.string().min(1),
  retryAfterSeconds: z.number().int().positive().nullable(),
});

export const VelaHistoryResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), turns: z.array(VelaChatTurnSchema) }),
  z.object({ success: z.literal(false), error: VelaErrorSchema }),
]);

export const VelaMessageResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), turn: VelaChatTurnSchema }),
  z.object({ success: z.literal(false), error: VelaErrorSchema }),
]);

export type SendVelaMessage = z.infer<typeof SendVelaMessageSchema>;
export type VelaChatTurn = z.infer<typeof VelaChatTurnSchema>;
