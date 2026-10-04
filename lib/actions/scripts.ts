"use server";

import { db } from "@/lib/db";
import { ideas, scripts, scriptVersions, seraChatTurns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateScriptDraft } from "@/lib/ai/script-writer";
import { reviseScript } from "@/lib/ai/script-reviser";
import { converseWithSera } from "@/lib/ai/sera-chat";
import { SendSeraMessageSchema, type SeraChatResult } from "@/lib/ai/sera-chat-contract";
import { getRecentSeraChatTurns } from "@/lib/db/queries/sera-chat";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";

const CreateDraftSchema = z.object({
  ideaId: z.string().min(1),
  format: z.string().default("Reel"),
  targetDurationSec: z.coerce.number().min(15).max(180).default(45),
});

export async function createScriptDraftAction(formData: FormData) {
  const parsed = CreateDraftSchema.parse({
    ideaId: formData.get("ideaId"),
    format: formData.get("format") || "Reel",
    targetDurationSec: formData.get("targetDurationSec") || 45,
  });

  const idea = db.select().from(ideas).where(eq(ideas.id, parsed.ideaId)).get();
  if (!idea || idea.status !== "saved") {
    throw new Error("Choose a finalized content idea before drafting a script.");
  }

  const result = await generateScriptDraft({
    ideaId: idea.id,
    topic: `${idea.topic}\n\nApproved strategic angle: ${idea.angleHook}`,
    format: parsed.format,
    targetDurationSec: parsed.targetDurationSec,
  });
  db.update(ideas).set({ status: "converted" }).where(eq(ideas.id, idea.id)).run();

  revalidatePath("/scripts");
  revalidatePath("/");

  return { success: true, scriptId: result.scriptId };
}

export async function deleteScriptAction(scriptId: string) {
  const parsedScriptId = z.string().min(1).parse(scriptId);
  const script = db.select().from(scripts).where(eq(scripts.id, parsedScriptId)).get();
  if (!script) throw new Error("Script not found.");

  db.transaction((tx) => {
    tx.delete(scripts).where(eq(scripts.id, parsedScriptId)).run();
    if (script.ideaId) {
      tx.update(ideas).set({ status: "saved" }).where(eq(ideas.id, script.ideaId)).run();
    }
  });
  revalidatePath("/scripts");
  revalidatePath("/ideas");
  revalidatePath("/");
  return { success: true };
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

function seraErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = typeof error.status === "number" ? error.status : undefined;
    if (status === 429 || status === 503) return "Sera is busy right now. Try sending that message again in a minute.";
  }
  if (error instanceof Error) {
    if (error.message.includes("GEMINI_API_KEY")) return "Sera is not connected. Add your Gemini API key and try again.";
    if (error.message.toLowerCase().includes("too long") || error.message.toLowerCase().includes("timed out")) {
      return "Sera took too long to respond. Please try again.";
    }
    if (error.message.startsWith("Set up your Brand Brain")) return error.message;
  }
  return "Sera could not respond right now. Your script was not changed.";
}

export async function sendSeraMessageAction(input: z.infer<typeof SendSeraMessageSchema>): Promise<SeraChatResult> {
  const parsed = SendSeraMessageSchema.parse(input);
  const script = db.select().from(scripts).where(eq(scripts.id, parsed.scriptId)).get();
  if (!script) throw new Error("Script not found");

  const existing = db.select().from(seraChatTurns).where(eq(seraChatTurns.id, parsed.requestId)).get();
  if (existing?.status === "completed" && existing.assistantMessage && existing.action) {
    const savedRevision = existing.revisionVersionId
      ? db.select().from(scriptVersions).where(eq(scriptVersions.id, existing.revisionVersionId)).get()
      : null;
    return {
      turn: {
        id: existing.id,
        userMessage: existing.userMessage,
        assistantMessage: existing.assistantMessage,
        action: existing.action,
        revisionVersionId: existing.revisionVersionId,
        createdAt: existing.createdAt,
      },
      revisedContent: savedRevision?.fullContent ?? null,
      versionNumber: savedRevision?.versionNumber ?? null,
    };
  }
  if (existing) throw new Error("Sera is already handling this message. Please wait.");

  const createdAt = new Date().toISOString();
  db.insert(seraChatTurns).values({
    id: parsed.requestId,
    scriptId: parsed.scriptId,
    userMessage: parsed.message,
    status: "running",
    createdAt,
  }).run();

  try {
    const response = await converseWithSera({
      currentContent: parsed.currentContent,
      message: parsed.message,
      recentTurns: getRecentSeraChatTurns(parsed.scriptId),
    });
    let revisionVersionId: string | null = null;
    let versionNumber: number | null = null;
    const completedAt = new Date().toISOString();

    db.transaction((tx) => {
      if (response.revisedContent) {
        const latest = tx.select({ versionNumber: scriptVersions.versionNumber })
          .from(scriptVersions)
          .where(eq(scriptVersions.scriptId, parsed.scriptId))
          .orderBy(desc(scriptVersions.versionNumber))
          .limit(1)
          .get();
        versionNumber = (latest?.versionNumber ?? 0) + 1;
        revisionVersionId = `ver_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        tx.insert(scriptVersions).values({
          id: revisionVersionId,
          scriptId: parsed.scriptId,
          versionNumber,
          versionType: "ai_revision",
          fullContent: response.revisedContent,
        }).run();
        tx.update(scripts).set({ status: "drafting", updatedAt: completedAt })
          .where(eq(scripts.id, parsed.scriptId)).run();
      }
      tx.update(seraChatTurns).set({
        assistantMessage: response.reply,
        action: response.action,
        status: "completed",
        revisionVersionId,
        errorMessage: null,
        completedAt,
      }).where(eq(seraChatTurns.id, parsed.requestId)).run();
    });

    revalidatePath(`/scripts/${parsed.scriptId}`);
    revalidatePath("/scripts");
    return {
      turn: {
        id: parsed.requestId,
        userMessage: parsed.message,
        assistantMessage: response.reply,
        action: response.action,
        revisionVersionId,
        createdAt,
      },
      revisedContent: response.revisedContent,
      versionNumber,
    };
  } catch (error) {
    const message = seraErrorMessage(error);
    console.error("Sera conversation failed", { scriptId: parsed.scriptId, requestId: parsed.requestId, message });
    db.update(seraChatTurns).set({ status: "failed", errorMessage: message, completedAt: new Date().toISOString() })
      .where(eq(seraChatTurns.id, parsed.requestId)).run();
    throw new Error(message);
  }
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
