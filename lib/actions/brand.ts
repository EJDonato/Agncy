"use server";

import { db } from "@/lib/db";
import { brandProfiles, styleRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";

const BrandProfileSchema = z.object({
  creatorName: z.string().min(1, "Name is required"),
  niche: z.string().min(3, "Niche is required"),
  targetAudience: z.string().min(3, "Audience is required"),
  toneOfVoice: z.string().min(3, "Tone is required"),
  languageMix: z.string().default("Taglish (Filipino/English)"),
  dosAndDonts: z.string().optional(),
});

export async function saveBrandProfileAction(formData: FormData) {
  const parsed = BrandProfileSchema.parse({
    creatorName: formData.get("creatorName"),
    niche: formData.get("niche"),
    targetAudience: formData.get("targetAudience"),
    toneOfVoice: formData.get("toneOfVoice"),
    languageMix: formData.get("languageMix") || "Taglish (Filipino/English)",
    dosAndDonts: formData.get("dosAndDonts") || "",
  });

  const existing = db.select().from(brandProfiles).limit(1).get();

  if (existing) {
    db.update(brandProfiles)
      .set({
        ...parsed,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(brandProfiles.id, existing.id))
      .run();
  } else {
    db.insert(brandProfiles)
      .values({
        id: `bp_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        ...parsed,
      })
      .run();
  }

  revalidatePath("/brand");
  revalidatePath("/");
  return { success: true };
}

export async function approveStyleRuleAction(ruleId: string) {
  db.update(styleRules)
    .set({
      status: "active",
      approvedAt: new Date().toISOString(),
    })
    .where(eq(styleRules.id, ruleId))
    .run();

  revalidatePath("/brand");
  revalidatePath("/");
  return { success: true };
}

export async function rejectStyleRuleAction(ruleId: string) {
  db.update(styleRules)
    .set({
      status: "rejected",
    })
    .where(eq(styleRules.id, ruleId))
    .run();

  revalidatePath("/brand");
  revalidatePath("/");
  return { success: true };
}

const EditRuleSchema = z.object({
  ruleId: z.string().min(1),
  ruleText: z.string().trim().min(5),
  category: z.enum(["hook", "pacing", "vocabulary", "structure", "tone"]),
});

export async function editAndApproveStyleRuleAction(input: z.infer<typeof EditRuleSchema>) {
  const parsed = EditRuleSchema.parse(input);
  db.update(styleRules)
    .set({
      category: parsed.category,
      ruleText: parsed.ruleText,
      status: "active",
      approvedAt: new Date().toISOString(),
    })
    .where(eq(styleRules.id, parsed.ruleId))
    .run();

  revalidatePath("/brand");
  revalidatePath("/");
  return { success: true };
}

export async function createManualRuleAction(formData: FormData) {
  const ruleText = formData.get("ruleText") as string;
  const category = (formData.get("category") as "hook" | "pacing" | "vocabulary" | "structure" | "tone") || "tone";

  if (!ruleText || ruleText.trim().length < 5) {
    throw new Error("Rule text must be at least 5 characters");
  }

  const existingProfile = db.select().from(brandProfiles).limit(1).get();
  if (!existingProfile) {
    throw new Error("Save your Brand Brain profile before adding style rules.");
  }

  db.insert(styleRules).values({
    id: `rule_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    brandId: existingProfile.id,
    category,
    ruleText: ruleText.trim(),
    rationale: "Manually created by creator",
    status: "active",
    confidenceScore: 1.0,
    approvedAt: new Date().toISOString(),
  }).run();

  revalidatePath("/brand");
  revalidatePath("/");
  return { success: true };
}
