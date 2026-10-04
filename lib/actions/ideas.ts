"use server";

import { db } from "@/lib/db";
import { ideas, brandProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";
import { generateContentIdeas } from "@/lib/ai/content-strategist";

export async function deleteIdeaAction(ideaId: string) {
  const parsedIdeaId = z.string().min(1).parse(ideaId);
  db.delete(ideas).where(eq(ideas.id, parsedIdeaId)).run();
  revalidatePath("/ideas");
  revalidatePath("/");
  return { success: true };
}

const IdeaIdSchema = z.string().min(1);
const GenerateIdeasSchema = z.object({
  prompt: z.string().trim().max(1_500, "Your direction must be 1,500 characters or fewer.").optional(),
});

export async function generateContentIdeasAction(input?: { prompt?: string }) {
  const { prompt } = GenerateIdeasSchema.parse(input ?? {});
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before generating content ideas.");

  const generatedIdeas = await generateContentIdeas({ brandId: profile.id, prompt });
  db.transaction((tx) => {
    for (const idea of generatedIdeas) {
      tx.insert(ideas).values({
        id: `idea_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        brandId: profile.id,
        topic: idea.topic,
        angleHook: idea.angleHook,
        whySuggested: idea.whySuggested,
        predictedFitScore: idea.predictedFitScore,
        status: "suggested",
      }).run();
    }
  });
  revalidatePath("/ideas");
  return { success: true, count: generatedIdeas.length };
}

export async function finalizeIdeaAction(ideaId: string) {
  const parsedIdeaId = IdeaIdSchema.parse(ideaId);
  const idea = db.select().from(ideas).where(eq(ideas.id, parsedIdeaId)).get();
  if (!idea) throw new Error("Content idea not found.");
  if (idea.status === "converted") throw new Error("This content idea already has a script.");

  db.update(ideas).set({ status: "saved" }).where(eq(ideas.id, parsedIdeaId)).run();
  revalidatePath("/ideas");
  revalidatePath("/scripts");
  return { success: true };
}
