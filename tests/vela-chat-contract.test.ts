import assert from "node:assert/strict";
import test from "node:test";
import { generatedIdeasReply, isIdeaGenerationRequest } from "../lib/ai/vela-chat";
import { SendVelaMessageSchema, VelaMessageResponseSchema } from "../lib/ideas/vela-chat-contract";

test("recognizes direct and follow-up idea generation requests", () => {
  assert.equal(isIdeaGenerationRequest("Give me content ideas on this topic"), true);
  assert.equal(isIdeaGenerationRequest("Can you brainstorm angles about flood preparedness?"), true);
  assert.equal(isIdeaGenerationRequest("Give me more like the second one"), true);
  assert.equal(isIdeaGenerationRequest("Why is this hook too broad?"), false);
});

test("validates Vela messages and generated response metadata", () => {
  const request = SendVelaMessageSchema.parse({ requestId: "00000000-0000-4000-8000-000000000099", message: "Ideas about civic tech" });
  const response = VelaMessageResponseSchema.parse({
    success: true,
    turn: {
      id: request.requestId,
      userMessage: request.message,
      assistantMessage: "Added six ideas.",
      action: "generate",
      generatedIdeaCount: 6,
      createdAt: new Date().toISOString(),
    },
  });

  assert.equal(response.success, true);
});

test("summarizes generated cards in Vela's message", () => {
  const reply = generatedIdeasReply([{ topic: "Civic maps", angleHook: "Who owns the map?", whySuggested: "Clear public value", predictedFitScore: 0.9 }]);
  assert.match(reply, /\*\*1 content idea\*\*/);
  assert.match(reply, /\*\*Civic maps\*\*/);
});
