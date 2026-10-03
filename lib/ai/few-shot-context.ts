import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scripts, scriptVersions } from "@/lib/db/schema";

export function buildFewShotContext(): string {
  const recentScripts = db
    .select()
    .from(scripts)
    .where(eq(scripts.status, "finalized"))
    .orderBy(desc(scripts.updatedAt))
    .limit(3)
    .all();

  return recentScripts.flatMap((script, index) => {
    const finalVersion = db
      .select()
      .from(scriptVersions)
      .where(eq(scriptVersions.scriptId, script.id))
      .orderBy(desc(scriptVersions.versionNumber))
      .all()
      .find((version) => version.versionType === "final_version");
    if (!finalVersion) return [];

    return [[
      `RECENT CREATOR SCRIPT ${index + 1}: ${script.title}`,
      finalVersion.fullContent.slice(0, 2_500),
    ].join("\n")];
  }).join("\n\n");
}
