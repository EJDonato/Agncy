export const GEMINI_SCRIPT_MODELS = [
  "gemini-3.1-pro-preview",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
] as const;

export const GEMINI_CHAT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemma-4-31b-it",
] as const;

export const GEMINI_REVISION_MODELS = GEMINI_CHAT_MODELS;

export const GEMINI_IDEA_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
] as const;

export const GEMINI_ANALYST_MODELS = GEMINI_IDEA_MODELS;

export const GEMINI_AXIOM_CHAT_MODELS = GEMINI_CHAT_MODELS;

export const ANTIGRAVITY_AGENT = "antigravity-preview-09-2026";

export const GEMINI_SCRIPT_MODEL_LABEL = "Gemini 3.1 Pro";
