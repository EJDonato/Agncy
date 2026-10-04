import assert from "node:assert/strict";
import test from "node:test";
import { PerformanceAnalysisApiResponseSchema } from "../lib/analytics/performance-analysis-contract";
import { PerformanceAnalysisSchema } from "../lib/ai/performance-analysis-schema";

test("accepts persisted performance-analysis job responses", () => {
  const result = PerformanceAnalysisApiResponseSchema.parse({
    success: true,
    job: {
      id: "analysis_test",
      status: "running",
      analysis: null,
      context: null,
      error: null,
      createdAt: "2026-10-04T07:00:00.000Z",
      completedAt: null,
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.success && result.job?.status, "running");
});

test("rejects malformed performance-analysis job responses", () => {
  assert.throws(() => PerformanceAnalysisApiResponseSchema.parse({
    success: true,
    job: { id: "analysis_test", status: "unknown" },
  }));
});

test("accepts stable API error responses", () => {
  const result = PerformanceAnalysisApiResponseSchema.parse({ success: false, error: "Invalid job ID." });
  assert.deepEqual(result, { success: false, error: "Invalid job ID." });
});

test("accepts detailed Gemini caveats beyond the former 500-character limit", () => {
  const analysis = PerformanceAnalysisSchema.parse({
    executiveSummary: "A sufficiently detailed performance summary.",
    winningPatterns: [{
      finding: "A repeatable pattern",
      evidence: "The supplied posts contain supporting metrics.",
      recommendation: "Test the pattern on the next post.",
    }],
    experiments: ["Run a controlled content experiment."],
    caveat: "Evidence remains observational. ".repeat(25),
  });

  assert.ok(analysis.caveat.length > 500);
});
