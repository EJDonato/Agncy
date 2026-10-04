import { Type, type Schema } from "@google/genai";
import { z } from "zod";

export const SeraChatDecisionSchema = z.object({
  mode: z.enum(["discuss", "revise"]),
  reply: z.string().trim().min(1).max(2_000),
  revisionInstruction: z.string().trim().max(2_000),
}).superRefine((value, context) => {
  if (value.mode === "revise" && value.revisionInstruction.length < 3) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["revisionInstruction"],
      message: "A revision decision requires an instruction.",
    });
  }
});

export const SeraChatDecisionGeminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mode: {
      type: Type.STRING,
      enum: ["discuss", "revise"],
      description: "Use revise only when the creator clearly asks to change or apply an edit to the script.",
    },
    reply: {
      type: Type.STRING,
      description: "A concise, natural response from Sera to the creator.",
    },
    revisionInstruction: {
      type: Type.STRING,
      description: "For revise, a complete editing instruction informed by the conversation. For discuss, an empty string.",
    },
  },
  required: ["mode", "reply", "revisionInstruction"],
};

export const SendSeraMessageSchema = z.object({
  requestId: z.string().uuid(),
  scriptId: z.string().min(1).max(200),
  currentContent: z.string().min(1, "Script cannot be empty").max(30_000),
  message: z.string().trim().min(1, "Write a message for Sera").max(1_500),
});

export interface SeraChatTurn {
  id: string;
  userMessage: string;
  assistantMessage: string;
  action: "discuss" | "revise";
  revisionVersionId: string | null;
  createdAt: string;
}

export interface SeraChatResult {
  turn: SeraChatTurn;
  revisedContent: string | null;
  versionNumber: number | null;
}
