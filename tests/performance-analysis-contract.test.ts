import assert from "node:assert/strict";
import test from "node:test";
import { PerformanceAnalysisApiResponseSchema } from "../lib/analytics/performance-analysis-contract";

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
