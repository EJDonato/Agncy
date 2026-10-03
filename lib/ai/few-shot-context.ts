import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scriptDiffs, scripts, scriptVersions } from "@/lib/db/schema";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";

interface RankedPair {
  title: string;
  draft: string;
  final: string;
  survival: number | null;
  views: number;
  score: number;
}

function words(value: string): Set<string> {
  return new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
}

function relevance(topic: string, title: string): number {
  const topicWords = words(topic);
  const titleWords = words(title);
  if (topicWords.size === 0) return 0;
  return [...topicWords].filter((word) => titleWords.has(word)).length / topicWords.size;
}

export async function buildFewShotContext(topic: string): Promise<string> {
  const finalized = db
    .select()
    .from(scripts)
    .where(eq(scripts.status, "finalized"))
    .orderBy(desc(scripts.updatedAt))
    .limit(20)
    .all();
  if (finalized.length === 0) return "";

  const postMetrics = await getPostsWithLatestMetrics();
  const ranked: RankedPair[] = finalized.flatMap((script) => {
    const versions = db
      .select()
      .from(scriptVersions)
      .where(eq(scriptVersions.scriptId, script.id))
      .orderBy(desc(scriptVersions.versionNumber))
      .all();
    const draft = versions.find((version) => version.versionType === "ai_initial_draft");
    const final = versions.find((version) => version.versionType === "final_version");
    if (!draft || !final) return [];

    const diff = db.select().from(scriptDiffs).where(eq(scriptDiffs.scriptId, script.id)).get();
    const linkedPost = postMetrics.find((post) => post.scriptId === script.id);
    const views = linkedPost?.views ?? 0;
    return [{
      title: script.title,
      draft: draft.fullContent,
      final: final.fullContent,
      survival: diff?.survivalPercentage ?? null,
      views,
      score: relevance(topic, script.title) * 10 + Math.log10(views + 1),
    }];
  });

  return ranked
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((pair, index) => [
      `EXAMPLE ${index + 1}: ${pair.title}`,
      `Performance: ${pair.views.toLocaleString()} views; draft survival: ${pair.survival ?? "unknown"}%`,
      `AI DRAFT:\n${pair.draft.slice(0, 1800)}`,
      `CREATOR FINAL:\n${pair.final.slice(0, 1800)}`,
    ].join("\n"))
    .join("\n\n");
}
