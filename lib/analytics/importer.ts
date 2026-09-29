import { db } from "@/lib/db";
import { importBatches, posts, postMetricSnapshots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseMetaCsv } from "./csv-parser";
import crypto from "node:crypto";

export interface ImportResult {
  success: boolean;
  batchId: string;
  rowsTotal: number;
  rowsImported: number;
  rowsUpdated: number;
  isDuplicate: boolean;
  message: string;
}

export async function importMetaCsvFile(fileBuffer: Buffer, fileName: string): Promise<ImportResult> {
  const { fileHash, posts: parsedPosts } = parseMetaCsv(fileBuffer);

  if (parsedPosts.length === 0) {
    throw new Error("No valid post rows found in the uploaded CSV.");
  }

  // Check if identical export file was previously ingested
  const existingBatch = db
    .select()
    .from(importBatches)
    .where(eq(importBatches.fileHash, fileHash))
    .get();

  if (existingBatch) {
    return {
      success: true,
      batchId: existingBatch.id,
      rowsTotal: parsedPosts.length,
      rowsImported: 0,
      rowsUpdated: 0,
      isDuplicate: true,
      message: `This exact export file was already imported on ${existingBatch.importedAt}. No duplicate records created.`,
    };
  }

  const batchId = `batch_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  let rowsImported = 0;
  let rowsUpdated = 0;

  // Transaction wrapping per Prime Directive 4 (synchronous with better-sqlite3)
  db.transaction((tx) => {
    // 1. Record the import batch
    tx.insert(importBatches).values({
      id: batchId,
      fileName,
      fileHash,
      rowsTotal: parsedPosts.length,
      rowsImported: 0,
      rowsUpdated: 0,
    }).run();

    // 2. Process each post and create its lifetime snapshot
    for (const item of parsedPosts) {
      const existingPost = tx
        .select()
        .from(posts)
        .where(eq(posts.externalPostId, item.externalPostId))
        .get();

      let targetPostId: string;

      if (existingPost) {
        targetPostId = existingPost.id;
        tx
          .update(posts)
          .set({
            rawTitle: item.rawTitle,
            normalizedTitle: item.normalizedTitle,
            permalink: item.permalink,
            postType: item.postType,
            durationSeconds: item.durationSeconds,
          })
          .where(eq(posts.id, targetPostId))
          .run();

        rowsUpdated++;
      } else {
        targetPostId = `post_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        tx.insert(posts).values({
          id: targetPostId,
          externalPostId: item.externalPostId,
          pageId: item.pageId,
          pageName: item.pageName,
          postType: item.postType,
          rawTitle: item.rawTitle,
          normalizedTitle: item.normalizedTitle,
          permalink: item.permalink,
          publishedAt: item.publishedAt,
          durationSeconds: item.durationSeconds,
        }).run();

        rowsImported++;
      }

      // 3. Insert snapshot linked to this import batch
      tx.insert(postMetricSnapshots).values({
        id: `snap_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
        postId: targetPostId,
        batchId,
        views: item.views,
        viewers: item.viewers,
        impressions: item.impressions,
        interactions: item.interactions,
        reactions: item.reactions,
        comments: item.comments,
        shares: item.shares,
        saves: item.saves,
        avgSecondsViewed: item.avgSecondsViewed,
        totalSecondsViewed: item.totalSecondsViewed,
        distributionScore: item.distributionScore,
        approximateEarningsUsd: item.approximateEarningsUsd,
      }).run();
    }

    // 4. Update the final batch totals
    tx
      .update(importBatches)
      .set({
        rowsImported,
        rowsUpdated,
      })
      .where(eq(importBatches.id, batchId))
      .run();
  });

  return {
    success: true,
    batchId,
    rowsTotal: parsedPosts.length,
    rowsImported,
    rowsUpdated,
    isDuplicate: false,
    message: `Successfully processed ${parsedPosts.length} posts (${rowsImported} new, ${rowsUpdated} updated).`,
  };
}
