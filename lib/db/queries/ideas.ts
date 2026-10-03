import { db } from "@/lib/db";
import { ideas } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export function getIdeasList() {
  return db
    .select()
    .from(ideas)
    .orderBy(desc(ideas.createdAt))
    .all();
}
