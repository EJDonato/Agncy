import { Type, type Schema } from "@google/genai";
import { z } from "zod";

export const ContextCandidateSchema = z.object({
  subject: z.string().trim().min(2).max(300),
  whyTimeSensitive: z.string().trim().min(3).max(500),
});

export const ContextCandidatesSchema = z.object({
  subjects: z.array(ContextCandidateSchema).max(6),
});

export const ContextCandidatesGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subjects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          whyTimeSensitive: { type: Type.STRING },
        },
        required: ["subject", "whyTimeSensitive"],
      },
    },
  },
  required: ["subjects"],
};

export const ContextSignalSchema = z.object({
  subject: z.string().trim().min(2).max(300),
  status: z.enum(["active", "ended", "evergreen", "recurring_closed", "unclear"]),
  evidenceSummary: z.string().trim().min(3).max(1_000),
  sourceUrl: z.string().url().nullable(),
});

export const ContextVerificationSchema = z.object({
  signals: z.array(ContextSignalSchema).max(6),
});

export type ContextCandidate = z.infer<typeof ContextCandidateSchema>;
export type ContextSignal = z.infer<typeof ContextSignalSchema>;

export const ContextVerificationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    signals: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          subject: { type: "string" },
          status: { type: "string", enum: ["active", "ended", "evergreen", "recurring_closed", "unclear"] },
          evidenceSummary: { type: "string" },
          sourceUrl: { type: ["string", "null"] },
        },
        required: ["subject", "status", "evidenceSummary", "sourceUrl"],
      },
    },
  },
  required: ["signals"],
} as const;
