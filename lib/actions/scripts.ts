"use server";

import { db } from "@/lib/db";
import { scripts, scriptVersions, scriptDiffs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateScriptDraft } from "@/lib/ai/script-writer";
import { computeScriptDiff } from "@/lib/diff/lcs";
import { analyzeEditAndSynthesizeStyle } from "@/lib/ai/style-synthesizer";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";

const CreateDraftSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  format: z.string().default("Reel"),
  targetDurationSec: z.coerce.number().default(45),
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

const SaveFinalSchema = z.object({
  scriptId: z.string(),
  finalContent: z.string().min(1, "Script cannot be empty"),
});

export async function saveFinalScriptVersionAction(data: { scriptId: string; finalContent: string }) {
  const { scriptId, finalContent } = SaveFinalSchema.parse(data);

  const existingScript = db.select().from(scripts).where(eq(scripts.id, scriptId)).get();
  if (!existingScript) {
    throw new Error("Script not found");
  }

  // Get initial AI draft to compute survival against
  const initialDraft = db
    .select()
    .from(scriptVersions)
    .where(eq(scriptVersions.scriptId, scriptId))
    .orderBy(scriptVersions.versionNumber)
    .limit(1)
    .get();

  const draftText = initialDraft ? initialDraft.fullContent : finalContent;
  const diffResult = computeScriptDiff(draftText, finalContent);

  const latestVersion = db
    .select({ versionNumber: scriptVersions.versionNumber })
    .from(scriptVersions)
    .where(eq(scriptVersions.scriptId, scriptId))
    .orderBy(desc(scriptVersions.versionNumber))
    .limit(1)
    .get();
  const newVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;
  const newVersionId = `ver_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const diffId = `diff_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  // Atomic transaction
  db.transaction((tx) => {
    // 1. Insert final version
    tx.insert(scriptVersions).values({
      id: newVersionId,
      scriptId,
      versionNumber: newVersionNumber,
      versionType: "final_version",
      fullContent: finalContent,
    }).run();

    // 2. Upsert script diff
    const existingDiff = tx.select().from(scriptDiffs).where(eq(scriptDiffs.scriptId, scriptId)).get();

    if (existingDiff) {
      tx.update(scriptDiffs)
        .set({
          finalVersionId: newVersionId,
          survivalPercentage: diffResult.survivalPercentage,
          draftTokenCount: diffResult.draftWordCount,
          finalTokenCount: diffResult.finalWordCount,
          retainedTokens: diffResult.retainedWordCount,
          tokenLcsMap: JSON.stringify({
            draft: diffResult.annotatedDraft,
            final: diffResult.annotatedFinal,
          }),
          analyzedAt: new Date().toISOString(),
        })
        .where(eq(scriptDiffs.id, existingDiff.id))
        .run();
    } else {
      tx.insert(scriptDiffs).values({
        id: diffId,
        scriptId,
        draftVersionId: initialDraft ? initialDraft.id : newVersionId,
        finalVersionId: newVersionId,
        survivalPercentage: diffResult.survivalPercentage,
        draftTokenCount: diffResult.draftWordCount,
        finalTokenCount: diffResult.finalWordCount,
        retainedTokens: diffResult.retainedWordCount,
        tokenLcsMap: JSON.stringify({
          draft: diffResult.annotatedDraft,
          final: diffResult.annotatedFinal,
        }),
      }).run();
    }

    // 3. Mark script finalized
    tx.update(scripts)
      .set({
        status: "finalized",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(scripts.id, scriptId))
      .run();
  });

  const analysis = await analyzeEditAndSynthesizeStyle({
    brandId: existingScript.brandId,
    scriptTitle: existingScript.title,
    initialDraft: draftText,
    finalEdit: finalContent,
    survivalPercentage: diffResult.survivalPercentage,
  });
  db.update(scriptDiffs)
    .set({ editSummary: analysis.editSummary })
    .where(eq(scriptDiffs.scriptId, scriptId))
    .run();

  revalidatePath(`/scripts/${scriptId}`);
  revalidatePath("/scripts");
  revalidatePath("/brand");
  revalidatePath("/");

  return {
    success: true,
    survivalPercentage: diffResult.survivalPercentage,
    editSummary: analysis.editSummary,
  };
}
