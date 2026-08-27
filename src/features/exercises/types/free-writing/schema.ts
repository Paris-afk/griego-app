import { z } from "zod";
import { Base } from "../base";

export const FreeWritingSchema = Base.extend({
  type: z.literal("free_writing"),
  prompt: z.object({ text: z.string() }),
  answer: z.string().optional(),
  accept: z.array(z.string()).default([]),
  aiTutor: z.boolean().default(true),
});

export type FreeWriting = z.infer<typeof FreeWritingSchema>;
