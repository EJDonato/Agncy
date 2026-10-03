"use server";

import { db } from "@/lib/db";
import { posts, scripts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LinkPostSchema = z.object({
  postId: z.string().min(1),
  scriptId: z.string().min(1).nullable(),
});

export async function linkPostToScriptAction(input: {
  postId: string;
  scriptId: string | null;
}) {
  const parsed = LinkPostSchema.parse(input);
  const post = db.select({ id: posts.id }).from(posts).where(eq(posts.id, parsed.postId)).get();
  if (!post) throw new Error("Post not found");

  if (parsed.scriptId) {
    const script = db
      .select({ id: scripts.id })
      .from(scripts)
      .where(eq(scripts.id, parsed.scriptId))
      .get();
    if (!script) throw new Error("Script not found");
  }

  db.update(posts)
    .set({ scriptId: parsed.scriptId })
    .where(eq(posts.id, parsed.postId))
    .run();

  revalidatePath("/analytics");
  revalidatePath("/scripts");
  revalidatePath("/");
  return { success: true };
}
