import assert from "node:assert/strict";
import test from "node:test";
import { SeraChatDecisionSchema, SendSeraMessageSchema } from "../lib/ai/sera-chat-contract";

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
