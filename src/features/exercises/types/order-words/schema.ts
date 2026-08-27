import { z } from "zod";
import { Base } from "../base";

export const OrderWordsSchema = Base.extend({
  type: z.literal("order_words"),
  prompt: z.object({ text: z.string() }),
  orderType: z.enum(["word", "sentence"]).default("word"),
  words: z.array(z.string()).min(2),
  answer: z.array(z.string()),
});

export type OrderWords = z.infer<typeof OrderWordsSchema>;
