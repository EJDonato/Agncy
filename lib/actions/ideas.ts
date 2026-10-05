"use server";

import { db } from "@/lib/db";
import { ideas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FinalizeIdeaInputSchema, type FinalizeIdeaInput } from "@/lib/ideas/idea-contract";

export async function deleteIdeaAction(ideaId: string) {
  const parsedIdeaId = z.string().min(1).parse(ideaId);
  db.delete(ideas).where(eq(ideas.id, parsedIdeaId)).run();
  revalidatePath("/ideas");
  revalidatePath("/");
  return { success: true };
}

export async function finalizeIdeaAction(input: FinalizeIdeaInput) {
  const parsed = FinalizeIdeaInputSchema.parse(input);
  const idea = db.select().from(ideas).where(eq(ideas.id, parsed.ideaId)).get();
  if (!idea) throw new Error("Content idea not found.");
  if (idea.status === "converted") throw new Error("This content idea already has a script.");
  if (idea.status === "saved") return { success: true };

  db.update(ideas)
    .set({ topic: parsed.topic, angleHook: parsed.angleHook, status: "saved" })
    .where(eq(ideas.id, parsed.ideaId))
    .run();
  revalidatePath("/ideas");
  revalidatePath("/scripts");
  return { success: true };
}
