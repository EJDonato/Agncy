"use server";

import { db } from "@/lib/db";
import { scripts, scriptVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateScriptDraft } from "@/lib/ai/script-writer";
import { reviseScript } from "@/lib/ai/script-reviser";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";

const CreateDraftSchema = z.object({
  topic: z.string().trim().min(3, "Topic must be at least 3 characters").max(1_000, "Topic cannot exceed 1,000 characters"),
  format: z.string().default("Reel"),
  targetDurationSec: z.coerce.number().min(15).max(180).default(45),
});

export async function createScriptDraftAction(formData: FormData) {
  const parsed = CreateDraftSchema.parse({
    topic: formData.get("topic"),
    format: formData.get("format") || "Reel",
    targetDurationSec: formData.get("targetDurationSec") || 45,
  });

  const result = await generateScriptDraft({
    topic: parsed.topic,
    format: parsed.format,
    targetDurationSec: parsed.targetDurationSec,
  });

  revalidatePath("/scripts");
  revalidatePath("/");

  return { success: true, scriptId: result.scriptId };
}

const ReviseScriptSchema = z.object({
  scriptId: z.string().min(1),
  currentContent: z.string().min(1, "Script cannot be empty").max(30_000),
  instruction: z.string().trim().min(3, "Describe the change you want").max(1_000),
});

export async function reviseScriptWithPromptAction(input: z.infer<typeof ReviseScriptSchema>) {
  const parsed = ReviseScriptSchema.parse(input);
  const script = db.select().from(scripts).where(eq(scripts.id, parsed.scriptId)).get();
  if (!script) throw new Error("Script not found");

  const revisedContent = await reviseScript({
    currentContent: parsed.currentContent,
    instruction: parsed.instruction,
  });
  const latestVersion = db
    .select({ versionNumber: scriptVersions.versionNumber })
    .from(scriptVersions)
    .where(eq(scriptVersions.scriptId, parsed.scriptId))
    .orderBy(desc(scriptVersions.versionNumber))
    .limit(1)
    .get();

  db.transaction((tx) => {
    tx.insert(scriptVersions).values({
      id: `ver_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      scriptId: parsed.scriptId,
      versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
      versionType: "ai_revision",
      fullContent: revisedContent,
    }).run();
    tx.update(scripts)
      .set({ status: "drafting", updatedAt: new Date().toISOString() })
      .where(eq(scripts.id, parsed.scriptId))
      .run();
  });

  revalidatePath(`/scripts/${parsed.scriptId}`);
  revalidatePath("/scripts");
  return { success: true, revisedContent };
}

const SaveFinalSchema = z.object({
  scriptId: z.string().min(1),
  finalContent: z.string().min(1, "Script cannot be empty").max(100_000, "Script cannot exceed 100,000 characters"),
  revisionInstructions: z.array(z.string().max(1_000)).optional(),
});

export async function saveFinalScriptVersionAction(data: {
  scriptId: string;
  finalContent: string;
}) {
  const { scriptId, finalContent } = SaveFinalSchema.parse(data);

  const existingScript = db.select().from(scripts).where(eq(scripts.id, scriptId)).get();
  if (!existingScript) {
    throw new Error("Script not found");
  }

  const latestVersion = db
    .select({ versionNumber: scriptVersions.versionNumber })
    .from(scriptVersions)
    .where(eq(scriptVersions.scriptId, scriptId))
    .orderBy(desc(scriptVersions.versionNumber))
    .limit(1)
    .get();
  const newVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;
  const newVersionId = `ver_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  db.transaction((tx) => {
    tx.insert(scriptVersions).values({
      id: newVersionId,
      scriptId,
      versionNumber: newVersionNumber,
      versionType: "final_version",
      fullContent: finalContent,
    }).run();

    tx.update(scripts)
      .set({
        status: "finalized",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(scripts.id, scriptId))
      .run();
  });

  revalidatePath(`/scripts/${scriptId}`);
  revalidatePath("/scripts");
  revalidatePath("/");

  return { success: true };
}
