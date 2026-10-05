import assert from "node:assert/strict";
import test from "node:test";
import { FinalizeIdeaInputSchema } from "../lib/ideas/idea-contract";

test("accepts an edited idea for atomic finalization", () => {
  const parsed = FinalizeIdeaInputSchema.parse({
    ideaId: "idea_123",
    topic: "  Better civic technology  ",
    angleHook: "  Why local tools fail without community input  ",
  });

  assert.equal(parsed.topic, "Better civic technology");
  assert.equal(parsed.angleHook, "Why local tools fail without community input");
});

test("rejects incomplete idea edits before finalization", () => {
  assert.equal(FinalizeIdeaInputSchema.safeParse({
    ideaId: "idea_123",
    topic: "No",
    angleHook: "",
  }).success, false);
});
