"use server";

import { db } from "@/lib/db";
import { contentSchedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";

const CreateScheduleSchema = z.object({
  scriptId: z.string().optional().nullable(),
  title: z.string().trim().min(1, "Post title or topic is required").max(300),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  scheduledTime: z.string().default("19:00"),
  format: z.string().default("Reel"),
  notes: z.string().optional().nullable(),
});

export async function createScheduleAction(input: z.infer<typeof CreateScheduleSchema>) {
  const parsed = CreateScheduleSchema.parse(input);
  const id = `sched_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  db.insert(contentSchedules).values({
    id,
    scriptId: parsed.scriptId || null,
    title: parsed.title,
    scheduledDate: parsed.scheduledDate,
    scheduledTime: parsed.scheduledTime,
    format: parsed.format,
    status: "planned",
    notes: parsed.notes || null,
  }).run();

  revalidatePath("/calendar");
  return { success: true, id };
}

export async function deleteScheduleAction(id: string) {
  const parsedId = z.string().min(1).parse(id);
  db.delete(contentSchedules).where(eq(contentSchedules.id, parsedId)).run();
  revalidatePath("/calendar");
  return { success: true };
}

export async function updateScheduleStatusAction(
  id: string,
  status: "planned" | "filmed" | "published"
) {
  const parsedId = z.string().min(1).parse(id);
  const parsedStatus = z.enum(["planned", "filmed", "published"]).parse(status);

  db.update(contentSchedules)
    .set({ status: parsedStatus })
    .where(eq(contentSchedules.id, parsedId))
    .run();

  revalidatePath("/calendar");
  return { success: true };
}
