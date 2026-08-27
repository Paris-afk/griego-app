import { z } from "zod";
import { Base } from "../base";

export const FillBlankSchema = Base.extend({
  type: z.literal("fill_blank"),
  prompt: z.object({ text: z.string() }),
  answer: z.string(),
  accept: z.array(z.string()).default([]),
});

export type FillBlank = z.infer<typeof FillBlankSchema>;
