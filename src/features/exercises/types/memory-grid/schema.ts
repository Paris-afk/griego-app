import { z } from "zod";
import { Base } from "../base";

// Memorama (EXERCISES.md §3.5). 6 parejas = 12 cartas en 3×4: en 390px eso da
// cartas de ~110px, con sitio para leer griego. Con 4 columnas quedarían en 80px.
export const MemoryGridSchema = Base.extend({
  type: z.literal("memory_grid"),
  pairs: z
    .array(z.object({ greek: z.string(), match: z.string() }))
    .min(3)
    .max(6),
  /** `audio`: la carta griega suena al voltearla, en vez de mostrar texto. */
  withAudio: z.boolean().default(false),
});

export type MemoryGrid = z.infer<typeof MemoryGridSchema>;
