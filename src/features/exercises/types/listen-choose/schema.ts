import { z } from "zod";
import { Base } from "../base";

// Oír y elegir (EXERCISES.md §3.2). Los distractores SUENAN IGUAL a propósito
// (νησί vs νισί) para forzar la decisión η/ι/υ — el error nº1 del par es→el.
export const ListenChooseSchema = Base.extend({
  type: z.literal("listen_choose"),
  answer: z.string(),
  options: z.array(z.string()).min(2),
  /** Pista en español, visible bajo el botón de audio. */
  meaning: z.string().optional(),
});

export type ListenChoose = z.infer<typeof ListenChooseSchema>;
