import { desc, eq } from "drizzle-orm";
import { getGeminiClient } from "./gemini";
import { ContentIdeasGeminiSchema, ContentIdeasResponseSchema, type ContentIdea } from "./schemas";
import { GEMINI_IDEA_MODELS } from "./models";
import { db } from "@/lib/db";
import { brandProfiles, posts, scripts } from "@/lib/db/schema";

interface GenerateIdeasParams {
  brandId: string;
  prompt?: string;
}

export function getPastContentContext(brandId: string): string {
  const pastPosts = db
    .select({ title: posts.normalizedTitle, fallbackTitle: posts.rawTitle, publishedAt: posts.publishedAt })
    .from(posts)
    .orderBy(desc(posts.publishedAt))
    .limit(20)
    .all();
  const pastScripts = db
    .select({ title: scripts.title, createdAt: scripts.createdAt })
    .from(scripts)
    .where(eq(scripts.brandId, brandId))
    .orderBy(desc(scripts.createdAt))
    .limit(12)
    .all();
  const postLines = pastPosts
    .map((post) => post.title || post.fallbackTitle)
    .filter((title): title is string => Boolean(title?.trim()))
    .map((title) => `- ${title}`);
  const scriptLines = pastScripts.map((script) => `- ${script.title}`);

  return [
    postLines.length ? `Past published content:\n${postLines.join("\n")}` : "No imported past posts are available yet.",
    scriptLines.length ? `Past script ideas:\n${scriptLines.join("\n")}` : "No prior scripts are available yet.",
  ].join("\n\n");
}

export async function generateContentIdeas({ brandId, prompt: strategistBrief }: GenerateIdeasParams): Promise<ContentIdea[]> {
  const profile = db.select().from(brandProfiles).where(eq(brandProfiles.id, brandId)).get();
  if (!profile) throw new Error("Set up your Brand Brain profile before generating content ideas.");

  const prompt = `You are the Content Strategist for ${profile.creatorName}.
Niche: ${profile.niche}
Audience: ${profile.targetAudience}
Voice: ${profile.toneOfVoice}
Language: ${profile.languageMix}
Guardrails: ${profile.dosAndDonts || "None supplied"}

Generate 6 distinct, specific short-form content ideas. Learn from the past content below: extend proven themes or find useful gaps, but never repeat a prior title. Do not invent performance claims or current facts. Each hook must express a clear tension and be appropriate for the creator's voice. Set predictedFitScore as a decimal from 0 to 1 (for example, 0.88), never as a percentage.

${strategistBrief ? `Creator direction: ${strategistBrief}\nPrioritize this direction where it fits the brand and guardrails. It is guidance, not a request to invent facts.` : "No additional creator direction was given; choose the strongest opportunities from the past content."}

${getPastContentContext(brandId)}

Return only JSON matching the requested schema.`;

  const ai = getGeminiClient();
  let rawText = "";
  let lastError: unknown = null;
  for (const model of GEMINI_IDEA_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: ContentIdeasGeminiSchema },
      });
      if (response.text) {
        rawText = response.text;
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (!rawText) throw lastError instanceof Error ? lastError : new Error("Gemini could not generate content ideas.");
  return ContentIdeasResponseSchema.parse(JSON.parse(rawText)).ideas;
}
