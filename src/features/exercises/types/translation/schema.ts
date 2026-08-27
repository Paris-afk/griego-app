import { z } from "zod";
import { Base } from "../base";

export const TranslationSchema = Base.extend({
  type: z.literal("translation"),
  prompt: z.object({ text: z.string() }),
  direction: z.enum(["el→es", "es→el"]).default("es→el"),
  answer: z.string(),
  accept: z.array(z.string()).default([]),
});

export type Translation = z.infer<typeof TranslationSchema>;
