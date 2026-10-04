import { db } from "@/lib/db";
import { ideas } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export function getIdeasList() {
  return db
    .select()
    .from(ideas)
    .orderBy(desc(ideas.createdAt))
    .all();
}

export function getFinalizedIdeas() {
  return db
    .select()
    .from(ideas)
    .where(eq(ideas.status, "saved"))
    .orderBy(desc(ideas.createdAt))
    .all();
}
