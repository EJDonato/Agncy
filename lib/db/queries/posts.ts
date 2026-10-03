import { db } from "@/lib/db";
import { importBatches, posts, postMetricSnapshots } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface PostWithLatestMetrics {
  id: string;
  externalPostId: string;
  scriptId: string | null;
  postType: string | null;
  rawTitle: string | null;
  normalizedTitle: string | null;
  permalink: string | null;
  publishedAt: string;
  durationSeconds: number | null;
  // Metrics from latest snapshot
  views: number;
  viewers: number;
  interactions: number;
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  avgSecondsViewed: number;
  distributionScore: string | null;
  snapshots: PostSnapshot[];
}

export interface PostSnapshot {
  id: string;
  views: number;
  interactions: number;
  avgSecondsViewed: number;
  capturedAt: string | null;
  fileName: string;
}

export async function getPostsWithLatestMetrics(): Promise<PostWithLatestMetrics[]> {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.publishedAt))
    .all();

  const results: PostWithLatestMetrics[] = [];

  for (const post of allPosts) {
    const latestSnapshot = await db
      .select()
      .from(postMetricSnapshots)
      .where(eq(postMetricSnapshots.postId, post.id))
      .orderBy(desc(postMetricSnapshots.capturedAt), sql`rowid DESC`)
      .limit(1)
      .get();

    const snapshotRows = await db
      .select({
        id: postMetricSnapshots.id,
        views: postMetricSnapshots.views,
        interactions: postMetricSnapshots.interactions,
        avgSecondsViewed: postMetricSnapshots.avgSecondsViewed,
        capturedAt: postMetricSnapshots.capturedAt,
        fileName: importBatches.fileName,
      })
      .from(postMetricSnapshots)
      .innerJoin(importBatches, eq(postMetricSnapshots.batchId, importBatches.id))
      .where(eq(postMetricSnapshots.postId, post.id))
      .orderBy(desc(postMetricSnapshots.capturedAt), sql`${postMetricSnapshots.id} DESC`)
      .all();

    results.push({
      id: post.id,
      externalPostId: post.externalPostId,
      scriptId: post.scriptId,
      postType: post.postType,
      rawTitle: post.rawTitle,
      normalizedTitle: post.normalizedTitle,
      permalink: post.permalink,
      publishedAt: post.publishedAt,
      durationSeconds: post.durationSeconds,
      views: latestSnapshot?.views ?? 0,
      viewers: latestSnapshot?.viewers ?? 0,
      interactions: latestSnapshot?.interactions ?? 0,
      reactions: latestSnapshot?.reactions ?? 0,
      comments: latestSnapshot?.comments ?? 0,
      shares: latestSnapshot?.shares ?? 0,
      saves: latestSnapshot?.saves ?? 0,
      avgSecondsViewed: latestSnapshot?.avgSecondsViewed ?? 0,
      distributionScore: latestSnapshot?.distributionScore ?? "--",
      snapshots: snapshotRows.map((snapshot) => ({
        id: snapshot.id,
        views: snapshot.views ?? 0,
        interactions: snapshot.interactions ?? 0,
        avgSecondsViewed: snapshot.avgSecondsViewed ?? 0,
        capturedAt: snapshot.capturedAt,
        fileName: snapshot.fileName,
      })),
    });
  }

  return results;
}
