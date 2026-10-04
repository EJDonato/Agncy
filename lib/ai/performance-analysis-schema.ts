import { z } from "zod";

export const PerformanceAnalysisSchema = z.object({
  executiveSummary: z.string().trim().min(10).max(2_000),
  winningPatterns: z.array(z.object({
    finding: z.string().trim().min(5).max(1_200),
    evidence: z.string().trim().min(5).max(2_000),
    recommendation: z.string().trim().min(5).max(1_200),
  })).min(1).max(4),
  experiments: z.array(z.string().trim().min(5).max(1_200)).min(1).max(3),
  caveat: z.string().trim().min(5).max(2_000),
});

export type PerformanceAnalysis = z.infer<typeof PerformanceAnalysisSchema>;
