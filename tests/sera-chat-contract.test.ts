import assert from "node:assert/strict";
import test from "node:test";
import { SeraChatDecisionSchema } from "../lib/ai/sera-chat-contract";
import { SeraChatApiResponseSchema, SendSeraMessageSchema } from "../lib/scripts/sera-chat-contract";

test("accepts a discussion response without a revision instruction", () => {
  const result = SeraChatDecisionSchema.parse({
    mode: "discuss",
    reply: "The hook explains the premise before creating tension.",
    revisionInstruction: "",
  });
  assert.equal(result.mode, "discuss");
});

test("rejects a revision response without a usable instruction", () => {
  const result = SeraChatDecisionSchema.safeParse({
    mode: "revise",
    reply: "I tightened the hook.",
    revisionInstruction: "",
  });
  assert.equal(result.success, false);
});

test("validates the client request boundary", () => {
  const result = SendSeraMessageSchema.safeParse({
    requestId: "not-a-uuid",
    scriptId: "script-1",
    currentContent: "Current script",
    message: "Please improve the hook.",
  });
  assert.equal(result.success, false);
});

test("accepts a structured quota error with a retry delay", () => {
  const result = SeraChatApiResponseSchema.parse({
    success: false,
    error: {
      code: "quota_exhausted",
      message: "Gemini's primary quota resets in about 9h 34m.",
      retryAfterSeconds: 34_440,
    },
  });
  assert.equal(result.success, false);
  assert.equal(result.success ? null : result.error.retryAfterSeconds, 34_440);
});
