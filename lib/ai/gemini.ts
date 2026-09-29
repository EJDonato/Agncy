import { GoogleGenAI } from "@google/genai";

let genAIInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (genAIInstance) {
    return genAIInstance;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Set it in your .env.local file.");
  }

  genAIInstance = new GoogleGenAI({ apiKey });
  return genAIInstance;
}
