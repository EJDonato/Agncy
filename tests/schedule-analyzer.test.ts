import assert from "node:assert/strict";
import test from "node:test";
import { analyzePostingStrategy } from "../lib/calendar/schedule-analyzer";
import type { PostWithLatestMetrics } from "../lib/db/queries/posts";

function makePost(id: string, publishedAt: string, views: number): PostWithLatestMetrics {
  return {
    id,
    externalPostId: id,
    scriptId: null,
    postType: "Reel",
    rawTitle: null,
    normalizedTitle: null,
    permalink: null,
    publishedAt,
    durationSeconds: null,
    views,
    viewers: 0,
    impressions: 0,
    interactions: 0,
    reactions: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    avgSecondsViewed: 0,
    totalSecondsViewed: 0,
    distributionScore: null,
    approximateEarningsUsd: 0,
    snapshots: [],
  };
}

test("preserves Meta export wall time and ranks repeated hours by average views", () => {
  const insights = analyzePostingStrategy([
    makePost("one", "2026-08-13T19:00:00.000Z", 1_000),
    makePost("two", "2026-08-20T19:00:00.000Z", 3_000),
    makePost("three", "2026-08-14T05:00:00.000Z", 400),
    makePost("four", "2026-08-21T05:00:00.000Z", 600),
    makePost("outlier", "2026-08-15T02:00:00.000Z", 100_000),
  ], new Date("2026-08-01T00:00:00.000Z"));

  assert.equal(insights.peakTime, "19:00");
  assert.equal(insights.peakTimePostCount, 2);
  assert.equal(insights.peakTimeAvgViews, 2_000);
  assert.equal(insights.bestDays.some((day) => day.dayName === "Thursday"), true);
});

test("uses the evening baseline when no publishing history exists", () => {
  const insights = analyzePostingStrategy([], new Date("2026-08-01T00:00:00.000Z"));
  assert.equal(insights.peakTime, "19:00");
  assert.equal(insights.peakTimePostCount, 0);
});
