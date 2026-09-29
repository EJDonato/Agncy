import { db } from "@/lib/db";
import { scripts, scriptVersions, scriptDiffs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface ScriptListItem {
  id: string;
  title: string;
  format: string | null;
  targetDurationSec: number | null;
  status: string;
  createdAt: string | null;
  survivalPercentage: number | null;
}

export function getScriptsList(): ScriptListItem[] {
  const allScripts = db
    .select()
    .from(scripts)
    .orderBy(desc(scripts.createdAt))
    .all();

  return allScripts.map((s) => {
    const diff = db
      .select()
      .from(scriptDiffs)
      .where(eq(scriptDiffs.scriptId, s.id))
      .get();

    return {
      id: s.id,
      title: s.title,
      format: s.format,
      targetDurationSec: s.targetDurationSec,
      status: s.status,
      createdAt: s.createdAt,
      survivalPercentage: diff ? diff.survivalPercentage : null,
    };
  });
}

export function getScriptWithVersions(scriptId: string) {
  const script = db
    .select()
    .from(scripts)
    .where(eq(scripts.id, scriptId))
    .get();

  if (!script) return null;

  const versions = db
    .select()
    .from(scriptVersions)
    .where(eq(scriptVersions.scriptId, scriptId))
    .orderBy(desc(scriptVersions.versionNumber))
    .all();

  const diff = db
    .select()
    .from(scriptDiffs)
    .where(eq(scriptDiffs.scriptId, scriptId))
    .get();

  const initialDraft = versions.find((v) => v.versionType === "ai_initial_draft") || versions[versions.length - 1];
  const latestFinal = versions.find((v) => v.versionType === "final_version") || initialDraft;

  return {
    script,
    versions,
    diff,
    initialDraft,
    latestFinal,
  };
}
