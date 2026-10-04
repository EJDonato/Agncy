import { db } from "@/lib/db";
import { contentSchedules, scripts } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export interface ContentScheduleItem {
  id: string;
  scriptId: string | null;
  title: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string | null;
  format: string | null;
  status: "planned" | "filmed" | "published";
  notes: string | null;
  createdAt: string | null;
  scriptTitle?: string | null;
}

export function getContentSchedules(): ContentScheduleItem[] {
  const items = db
    .select({
      id: contentSchedules.id,
      scriptId: contentSchedules.scriptId,
      title: contentSchedules.title,
      scheduledDate: contentSchedules.scheduledDate,
      scheduledTime: contentSchedules.scheduledTime,
      format: contentSchedules.format,
      status: contentSchedules.status,
      notes: contentSchedules.notes,
      createdAt: contentSchedules.createdAt,
      scriptTitle: scripts.title,
    })
    .from(contentSchedules)
    .leftJoin(scripts, eq(contentSchedules.scriptId, scripts.id))
    .orderBy(asc(contentSchedules.scheduledDate), asc(contentSchedules.scheduledTime))
    .all();

  return items;
}
