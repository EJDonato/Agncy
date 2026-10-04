"use server";

import { db } from "@/lib/db";
import { ideas, brandProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";
import { generateContentIdeas } from "@/lib/ai/content-strategist";
import { researchTrendIdeas } from "@/lib/ai/trend-researcher";
import type { ContentIdea } from "@/lib/ai/schemas";

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

function saveGeneratedIdeas(brandId: string, generatedIdeas: ContentIdea[], source: "generated" | "researched") {
  db.transaction((tx) => {
    for (const idea of generatedIdeas) {
      tx.insert(ideas).values({
        id: `idea_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        brandId,
        topic: idea.topic,
        angleHook: idea.angleHook,
        whySuggested: source === "researched" ? `Trend research · ${idea.whySuggested}` : idea.whySuggested,
        predictedFitScore: idea.predictedFitScore,
        status: "suggested",
      }).run();
    }
  });
}

export async function generateContentIdeasAction(input?: { prompt?: string }) {
  const { prompt } = GenerateIdeasSchema.parse(input ?? {});
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before generating content ideas.");

  const generatedIdeas = await generateContentIdeas({ brandId: profile.id, prompt });
  saveGeneratedIdeas(profile.id, generatedIdeas, "generated");
  revalidatePath("/ideas");
  return { success: true, count: generatedIdeas.length };
}

export async function researchTrendIdeasAction(input?: { prompt?: string }) {
  const { prompt } = GenerateIdeasSchema.parse(input ?? {});
  const profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before researching trends.");

  const researchedIdeas = await researchTrendIdeas({ brandId: profile.id, prompt });
  saveGeneratedIdeas(profile.id, researchedIdeas, "researched");
  revalidatePath("/ideas");
  return { success: true, count: researchedIdeas.length };
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
