import assert from "node:assert/strict";
import test from "node:test";
import { formatScriptDraftToMarkdown } from "../lib/ai/schemas";

test("formats generated and revised scripts into readable sections", () => {
  const output = formatScriptDraftToMarkdown({
    title: "A Better Hook",
    estimated_duration_sec: 30,
    total_word_count: 70,
    hook: { visual_cue: "Close-up", spoken_text: "Start here.", duration_est_sec: 3 },
    body_beats: [
      { beat_number: 1, visual_cue: "Cutaway", spoken_text: "First point.", pacing: "punchy" },
      { beat_number: 2, visual_cue: "Demo", spoken_text: "Second point.", pacing: "deliberate" },
    ],
    cta: { visual_cue: "On screen text", spoken_text: "What would you change?" },
  });

  assert.match(output, /## \[HOOK\]/);
  assert.match(output, /### Beat 1 \(punchy\)/);
  assert.match(output, /### Beat 2 \(deliberate\)/);
  assert.match(output, /## \[CTA\]/);
  assert.ok(output.split("\n").length >= 15);
});
