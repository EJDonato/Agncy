"use server";

import { db } from "@/lib/db";
import { ideas, brandProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";

const CreateIdeaSchema = z.object({
  topic: z.string().trim().min(3, "Topic must be at least 3 characters").max(500),
  angleHook: z.string().trim().min(3, "Hook angle is required").max(500),
  whySuggested: z.string().trim().max(1000).default("Creator topic seed"),
});

export async function createIdeaAction(formData: FormData) {
  const parsed = CreateIdeaSchema.parse({
    topic: formData.get("topic"),
    angleHook: formData.get("angleHook"),
    whySuggested: formData.get("whySuggested") || "Creator topic seed",
  });

  let profile = db.select().from(brandProfiles).limit(1).get();
  if (!profile) {
    const profileId = `bp_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    db.insert(brandProfiles)
      .values({
        id: profileId,
        creatorName: "Elton",
        niche: "Civic tech, grassroots community apps, public interest technology",
        targetAudience: "Filipino youth developers, civic organizers, local community builders",
        toneOfVoice: "Direct, grounded, empathetic, analytical. No cringe hype or generic buzzwords.",
        languageMix: "Taglish (Filipino/English)",
        dosAndDonts: "Never start with 'Hey guys'. Start directly at the paradox or friction.",
      })
      .run();
    profile = db.select().from(brandProfiles).limit(1).get();
  }

  const id = `idea_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  db.insert(ideas)
    .values({
      id,
      brandId: profile!.id,
      topic: parsed.topic,
      angleHook: parsed.angleHook,
      whySuggested: parsed.whySuggested,
      status: "saved",
      predictedFitScore: 0.9,
    })
    .run();

  revalidatePath("/ideas");
  revalidatePath("/");
  return { success: true, ideaId: id };
}

export async function deleteIdeaAction(ideaId: string) {
  db.delete(ideas).where(eq(ideas.id, ideaId)).run();
  revalidatePath("/ideas");
  revalidatePath("/");
  return { success: true };
}
