import { z } from "zod";
import { Type, type Schema } from "@google/genai";

export const ScriptDraftSchema = z.object({
  title: z.string().min(1),
  estimated_duration_sec: z.number().int().positive(),
  total_word_count: z.number().int().positive(),
  hook: z.object({
    visual_cue: z.string(),
    spoken_text: z.string(),
    duration_est_sec: z.number(),
  }),
  body_beats: z.array(
    z.object({
      beat_number: z.number(),
      visual_cue: z.string(),
      spoken_text: z.string(),
      pacing: z.enum(["rapid", "deliberate", "punchy"]),
    })
  ),
  cta: z.object({
    visual_cue: z.string(),
    spoken_text: z.string(),
  }),
});

export type ScriptDraft = z.infer<typeof ScriptDraftSchema>;

export const ContentIdeaSchema = z.object({
  topic: z.string().trim().min(3).max(500),
  angleHook: z.string().trim().min(3).max(500),
  whySuggested: z.string().trim().min(3).max(1_000),
  // Gemini sometimes returns a human-readable percentage (e.g. 88) instead
  // of a decimal (0.88). Normalize both formats at this external boundary.
  predictedFitScore: z.number().min(0).max(100).transform((score) => score > 1 ? score / 100 : score),
});

export const ContentIdeasResponseSchema = z.object({
  ideas: z.array(ContentIdeaSchema).min(1).max(8),
});

export type ContentIdea = z.infer<typeof ContentIdeaSchema>;

export const ContentIdeasGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          angleHook: { type: Type.STRING },
          whySuggested: { type: Type.STRING },
          predictedFitScore: { type: Type.NUMBER, description: "Fit score from 0 to 1, where 1 is the best fit." },
        },
        required: ["topic", "angleHook", "whySuggested", "predictedFitScore"],
      },
    },
  },
  required: ["ideas"],
};

export const ScriptDraftResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    estimated_duration_sec: { type: Type.INTEGER },
    total_word_count: { type: Type.INTEGER },
    hook: {
      type: Type.OBJECT,
      properties: {
        visual_cue: { type: Type.STRING },
        spoken_text: { type: Type.STRING },
        duration_est_sec: { type: Type.NUMBER },
      },
      required: ["visual_cue", "spoken_text", "duration_est_sec"],
    },
    body_beats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          beat_number: { type: Type.NUMBER },
          visual_cue: { type: Type.STRING },
          spoken_text: { type: Type.STRING },
          pacing: { type: Type.STRING, enum: ["rapid", "deliberate", "punchy"] },
        },
        required: ["beat_number", "visual_cue", "spoken_text", "pacing"],
      },
    },
    cta: {
      type: Type.OBJECT,
      properties: {
        visual_cue: { type: Type.STRING },
        spoken_text: { type: Type.STRING },
      },
      required: ["visual_cue", "spoken_text"],
    },
  },
  required: ["title", "estimated_duration_sec", "total_word_count", "hook", "body_beats", "cta"],
};

export function formatScriptDraftToMarkdown(draft: ScriptDraft): string {
  const lines: string[] = [];

  lines.push(`# ${draft.title}`);
  lines.push(`Target Duration: ~${draft.estimated_duration_sec}s | Words: ~${draft.total_word_count}\n`);

  lines.push(`## [HOOK] (${draft.hook.duration_est_sec}s)`);
  lines.push(`[VISUAL: ${draft.hook.visual_cue}]`);
  lines.push(`"${draft.hook.spoken_text}"\n`);

  lines.push(`## [BODY BEATS]`);
  for (const beat of draft.body_beats) {
    lines.push(`### Beat ${beat.beat_number} (${beat.pacing})`);
    lines.push(`[VISUAL: ${beat.visual_cue}]`);
    lines.push(`"${beat.spoken_text}"\n`);
  }

  lines.push(`## [CTA]`);
  lines.push(`[VISUAL: ${draft.cta.visual_cue}]`);
  lines.push(`"${draft.cta.spoken_text}"`);

  return lines.join("\n");
}
