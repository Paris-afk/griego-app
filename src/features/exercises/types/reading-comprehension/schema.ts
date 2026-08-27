import { z } from "zod";
import { Base } from "../base";

export const ReadingComprehensionSchema = Base.extend({
  type: z.literal("reading_comprehension"),
  prompt: z.object({ text: z.string() }),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).min(2),
      answer: z.string(),
    }),
  ),
});

export type ReadingComprehension = z.infer<typeof ReadingComprehensionSchema>;
