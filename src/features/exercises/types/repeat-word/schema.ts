import { z } from "zod";
import { Base } from "../base";

// Fase 8 — pendiente de proveedor de STT (ARCHITECTURE.md §1.1). Solo schema.
export const RepeatWordSchema = Base.extend({
  type: z.literal("repeat_word"),
  prompt: z.object({ text: z.string() }),
  target: z.string(),
});

export type RepeatWord = z.infer<typeof RepeatWordSchema>;
