import { z } from "zod";
import { Base } from "../base";

export const AlphabetDrillSchema = Base.extend({
  type: z.literal("alphabet_drill"),
  letter: z.string(),
  prompt: z.object({ text: z.string().optional() }),
  answer: z.string(),
  accept: z.array(z.string()).default([]),
});

export type AlphabetDrill = z.infer<typeof AlphabetDrillSchema>;
