"use server";

import { analyzePerformanceWithGemini } from "@/lib/ai/performance-analyst";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { db } from "@/lib/db";
import { brandProfiles } from "@/lib/db/schema";
import { z } from "zod";

const PerformanceAnalysisInputSchema = z.object({
  currentConstraints: z.string().trim().max(1_500, "Current context must be 1,500 characters or fewer.").optional(),
});

export async function generatePerformanceAnalysisAction(input?: { currentConstraints?: string }) {
  const { currentConstraints } = PerformanceAnalysisInputSchema.parse(input ?? {});
  const posts = await getPostsWithLatestMetrics();
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before analyzing performance.");

  return analyzePerformanceWithGemini(posts, {
    creatorName: profile.creatorName,
    niche: profile.niche,
    targetAudience: profile.targetAudience,
    toneOfVoice: profile.toneOfVoice,
    currentConstraints,
  });
}
