"use server";

import { db } from "@/lib/db";
import { scripts, scriptVersions, scriptDiffs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateScriptDraft } from "@/lib/ai/script-writer";
import { computeScriptDiff } from "@/lib/diff/lcs";
import { analyzeEditAndSynthesizeStyle } from "@/lib/ai/style-synthesizer";
import { reviseScript } from "@/lib/ai/script-reviser";
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
  scriptId: z.string(),
  finalContent: z.string().min(1, "Script cannot be empty"),
  revisionInstructions: z.array(z.string().trim().min(3).max(1_000)).max(5).default([]),
});

export async function saveFinalScriptVersionAction(data: {
  scriptId: string;
  finalContent: string;
  revisionInstructions?: string[];
}) {
  const { scriptId, finalContent, revisionInstructions } = SaveFinalSchema.parse(data);

  const existingScript = db.select().from(scripts).where(eq(scripts.id, scriptId)).get();
  if (!existingScript) {
    throw new Error("Script not found");
  }

  const versions = db
    .select()
    .from(scriptVersions)
    .where(eq(scriptVersions.scriptId, scriptId))
    .orderBy(desc(scriptVersions.versionNumber))
    .all();
  const comparisonDraft = versions.find((version) =>
    version.versionType === "ai_revision" || version.versionType === "ai_initial_draft"
  );

  const draftText = comparisonDraft?.fullContent ?? finalContent;
  const diffResult = computeScriptDiff(draftText, finalContent);

  const newVersionNumber = (versions[0]?.versionNumber ?? 0) + 1;
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
          draftVersionId: comparisonDraft?.id ?? newVersionId,
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
        draftVersionId: comparisonDraft?.id ?? newVersionId,
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
    revisionInstructions,
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
