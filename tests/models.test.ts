import assert from "node:assert/strict";
import test from "node:test";
import { ANTIGRAVITY_AGENT, GEMINI_AXIOM_CHAT_MODELS, GEMINI_CHAT_MODELS, GEMINI_IDEA_MODELS, GEMINI_REVISION_MODELS } from "../lib/ai/models";

test("uses Gemma 4 31B as the final revision fallback", () => {
  assert.equal(GEMINI_REVISION_MODELS.at(-1), "gemma-4-31b-it");
});

test("uses Gemma 4 31B as the final Axiom fallback", () => {
  assert.equal(GEMINI_AXIOM_CHAT_MODELS.at(-1), "gemma-4-31b-it");
});

test("uses every configured text quota bucket for chat fallbacks", () => {
  assert.deepEqual(GEMINI_CHAT_MODELS, [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3-flash-preview",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemma-4-31b-it",
  ]);
  assert.equal(GEMINI_REVISION_MODELS, GEMINI_CHAT_MODELS);
  assert.equal(GEMINI_IDEA_MODELS, GEMINI_CHAT_MODELS);
  assert.equal(ANTIGRAVITY_AGENT, "antigravity-preview-09-2026");
});
