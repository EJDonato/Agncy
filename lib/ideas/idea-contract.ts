import { z } from "zod";

export const FinalizeIdeaInputSchema = z.object({
  ideaId: z.string().min(1),
  topic: z.string().trim().min(3, "The title must be at least 3 characters.").max(500),
  angleHook: z.string().trim().min(3, "The content angle must be at least 3 characters.").max(500),
});

export type FinalizeIdeaInput = z.infer<typeof FinalizeIdeaInputSchema>;
