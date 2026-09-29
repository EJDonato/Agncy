import { z } from "zod";

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
