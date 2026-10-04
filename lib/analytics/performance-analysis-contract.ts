import { z } from "zod";
import { PerformanceAnalysisSchema } from "@/lib/ai/performance-analysis-schema";

export const PerformanceAnalysisContextSummarySchema = z.object({
  checkedAt: z.string().datetime(),
  activeCount: z.number().int().nonnegative(),
  excludedCount: z.number().int().nonnegative(),
  unclearCount: z.number().int().nonnegative(),
});

export const PerformanceAnalysisJobSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["queued", "running", "completed", "failed"]),
  analysis: PerformanceAnalysisSchema.nullable(),
  context: PerformanceAnalysisContextSummarySchema.nullable(),
  error: z.string().nullable(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

export const PerformanceAnalysisApiResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), job: PerformanceAnalysisJobSchema.nullable() }),
  z.object({ success: z.literal(false), error: z.string().min(1) }),
]);

export type PerformanceAnalysisContextSummary = z.infer<typeof PerformanceAnalysisContextSummarySchema>;
export type PerformanceAnalysisJob = z.infer<typeof PerformanceAnalysisJobSchema>;
