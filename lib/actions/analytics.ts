"use server";

import { analyzePerformanceWithGemini } from "@/lib/ai/performance-analyst";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";

export async function generatePerformanceAnalysisAction() {
  const posts = await getPostsWithLatestMetrics();
  return analyzePerformanceWithGemini(posts);
}
