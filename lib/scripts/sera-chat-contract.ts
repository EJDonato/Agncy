import { z } from "zod";

export const SendSeraMessageSchema = z.object({
  requestId: z.string().uuid(),
  scriptId: z.string().min(1).max(200),
  currentContent: z.string().min(1, "Script cannot be empty").max(30_000),
  message: z.string().trim().min(1, "Write a message for Sera").max(1_500),
});

export const SeraChatTurnSchema = z.object({
  id: z.string().min(1),
  userMessage: z.string(),
  assistantMessage: z.string(),
  action: z.enum(["discuss", "revise"]),
  revisionVersionId: z.string().nullable(),
  createdAt: z.string().min(1),
});

export const SeraChatResultSchema = z.object({
  turn: SeraChatTurnSchema,
  revisedContent: z.string().nullable(),
  versionNumber: z.number().int().positive().nullable(),
});

export const SeraChatApiResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), result: SeraChatResultSchema }),
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.enum(["invalid_request", "not_found", "conflict", "quota_exhausted", "unavailable", "not_configured", "unknown"]),
      message: z.string().min(1),
      retryAfterSeconds: z.number().int().positive().nullable(),
    }),
  }),
]);

export type SendSeraMessage = z.infer<typeof SendSeraMessageSchema>;
export type SeraChatTurn = z.infer<typeof SeraChatTurnSchema>;
export type SeraChatResult = z.infer<typeof SeraChatResultSchema>;
export type SeraChatApiResponse = z.infer<typeof SeraChatApiResponseSchema>;
