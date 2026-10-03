import { db } from "@/lib/db";
import { scripts, scriptVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface ScriptListItem {
  id: string;
  title: string;
  format: string | null;
  targetDurationSec: number | null;
  status: string;
  createdAt: string | null;
}

export function getScriptsList(): ScriptListItem[] {
  const allScripts = db
    .select()
    .from(scripts)
    .orderBy(desc(scripts.createdAt))
    .all();

  return allScripts.map((s) => ({
      id: s.id,
      title: s.title,
      format: s.format,
      targetDurationSec: s.targetDurationSec,
      status: s.status,
      createdAt: s.createdAt,
    }));
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

  const initialDraft = versions.find((v) => v.versionType === "ai_initial_draft") || versions[versions.length - 1];
  const latestAiVersion = versions.find((v) =>
    v.versionType === "ai_revision" || v.versionType === "ai_initial_draft"
  ) || initialDraft;
  const latestEditable = versions[0] || initialDraft;

  return {
    script,
    versions,
    initialDraft,
    latestAiVersion,
    latestEditable,
  };
}
