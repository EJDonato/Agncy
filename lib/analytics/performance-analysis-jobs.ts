import crypto from "node:crypto";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { analyzePerformanceWithGemini } from "@/lib/ai/performance-analyst";
import { verifyPerformanceContext } from "@/lib/ai/performance-context-verifier";
import { PerformanceAnalysisSchema } from "@/lib/ai/performance-analysis-schema";
import { db } from "@/lib/db";
import { brandProfiles, performanceAnalysisJobs } from "@/lib/db/schema";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import {
  PerformanceAnalysisContextSummarySchema,
  type PerformanceAnalysisContextSummary,
  type PerformanceAnalysisJob,
} from "./performance-analysis-contract";

const ACTIVE_JOB_TIMEOUT_MS = 20 * 60 * 1_000;

type JobRow = typeof performanceAnalysisJobs.$inferSelect;

function parseJson<T>(value: string | null, schema: z.ZodType<T>): T | null {
  if (!value) return null;
  try {
    return schema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

function toJob(row: JobRow): PerformanceAnalysisJob {
  return {
    id: row.id,
    status: row.status,
    analysis: parseJson(row.analysisJson, PerformanceAnalysisSchema),
    context: parseJson(row.contextJson, PerformanceAnalysisContextSummarySchema),
    error: row.errorMessage,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
  };
}

function failIfStale(row: JobRow): JobRow {
  if (row.status !== "queued" && row.status !== "running") return row;
  const activityTime = Date.parse(row.startedAt ?? row.createdAt);
  if (Number.isFinite(activityTime) && Date.now() - activityTime <= ACTIVE_JOB_TIMEOUT_MS) return row;

  const completedAt = new Date().toISOString();
  const errorMessage = "The previous analysis stopped before it could finish. Start a new analysis to try again.";
  db.update(performanceAnalysisJobs).set({ status: "failed", errorMessage, completedAt })
    .where(eq(performanceAnalysisJobs.id, row.id)).run();
  return { ...row, status: "failed", errorMessage, completedAt };
}

function userFacingError(error: unknown): string {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = typeof error.status === "number" ? error.status : undefined;
    if (status === 429 || status === 503) {
      return "Gemini is busy right now. Please start the analysis again in a minute.";
    }
  }
  if (error instanceof Error && error.message.toLocaleLowerCase().includes("timed out")) {
    return "The analysis timed out. Please try again.";
  }
  return error instanceof Error ? error.message : "Gemini could not analyze performance right now.";
}

export function getPerformanceAnalysisJob(id: string): PerformanceAnalysisJob | null {
  const row = db.select().from(performanceAnalysisJobs).where(eq(performanceAnalysisJobs.id, id)).get();
  return row ? toJob(failIfStale(row)) : null;
}

export function getLatestPerformanceAnalysisJob(): PerformanceAnalysisJob | null {
  const row = db.select().from(performanceAnalysisJobs).orderBy(desc(performanceAnalysisJobs.createdAt)).limit(1).get();
  return row ? toJob(failIfStale(row)) : null;
}

export function createPerformanceAnalysisJob(): { job: PerformanceAnalysisJob; isNew: boolean } {
  const active = db.select().from(performanceAnalysisJobs)
    .where(inArray(performanceAnalysisJobs.status, ["queued", "running"]))
    .orderBy(desc(performanceAnalysisJobs.createdAt)).limit(1).get();
  if (active) {
    const current = failIfStale(active);
    if (current.status === "queued" || current.status === "running") {
      return { job: toJob(current), isNew: false };
    }
  }

  const now = new Date().toISOString();
  const row: typeof performanceAnalysisJobs.$inferInsert = {
    id: `analysis_${crypto.randomUUID()}`,
    status: "queued",
    createdAt: now,
  };
  db.insert(performanceAnalysisJobs).values(row).run();
  const created = getPerformanceAnalysisJob(row.id);
  if (!created) throw new Error("Could not create the performance analysis job.");
  return { job: created, isNew: true };
}

export async function runPerformanceAnalysisJob(id: string): Promise<void> {
  db.update(performanceAnalysisJobs).set({ status: "running", startedAt: new Date().toISOString() })
    .where(eq(performanceAnalysisJobs.id, id)).run();

  try {
    const posts = await getPostsWithLatestMetrics();
    const profile = db.select().from(brandProfiles).limit(1).get();
    if (!profile) throw new Error("Set up your Brand Brain profile before analyzing performance.");
    const verifiedSignals = await verifyPerformanceContext(posts, profile.id);
    const analysis = await analyzePerformanceWithGemini(posts, {
      creatorName: profile.creatorName,
      niche: profile.niche,
      targetAudience: profile.targetAudience,
      toneOfVoice: profile.toneOfVoice,
      verifiedSignals,
    });
    const context: PerformanceAnalysisContextSummary = {
      checkedAt: new Date().toISOString(),
      activeCount: verifiedSignals.filter((signal) => signal.status === "active" || signal.status === "evergreen").length,
      excludedCount: verifiedSignals.filter((signal) => signal.status === "ended" || signal.status === "recurring_closed").length,
      unclearCount: verifiedSignals.filter((signal) => signal.status === "unclear").length,
    };
    db.update(performanceAnalysisJobs).set({
      status: "completed",
      analysisJson: JSON.stringify(analysis),
      contextJson: JSON.stringify(context),
      errorMessage: null,
      completedAt: new Date().toISOString(),
    }).where(eq(performanceAnalysisJobs.id, id)).run();
  } catch (error) {
    const message = userFacingError(error);
    console.error("Performance analysis job failed", { jobId: id, message });
    db.update(performanceAnalysisJobs).set({
      status: "failed",
      errorMessage: message,
      completedAt: new Date().toISOString(),
    }).where(eq(performanceAnalysisJobs.id, id)).run();
  }
}
