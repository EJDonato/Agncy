import { z } from "zod";

export const PerformanceAnalysisSchema = z.object({
  executiveSummary: z.string().trim().min(10).max(800),
  winningPatterns: z.array(z.object({
    finding: z.string().trim().min(5).max(500),
    evidence: z.string().trim().min(5).max(700),
    recommendation: z.string().trim().min(5).max(500),
  })).min(1).max(4),
  experiments: z.array(z.string().trim().min(5).max(500)).min(1).max(3),
  caveat: z.string().trim().min(5).max(500),
});

export type PerformanceAnalysis = z.infer<typeof PerformanceAnalysisSchema>;
