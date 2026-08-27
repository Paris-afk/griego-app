import { z } from "zod";
import { Base } from "../base";

export const MultipleChoiceSchema = Base.extend({
  type: z.literal("multiple_choice"),
  prompt: z.object({ text: z.string().optional(), image: z.string().optional() }),
  options: z
    .array(z.object({ text: z.string(), image: z.string().optional() }))
    .min(2),
  answer: z.string(),
});

export type MultipleChoice = z.infer<typeof MultipleChoiceSchema>;
