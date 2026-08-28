import { z } from "zod";
import { Base } from "../base";

// Unir mayúscula↔minúscula (EXERCISES.md §3.3). Cubre el hueco detectado en la
// Fase 4: el teclado solo produce minúsculas, así que las mayúsculas no se
// entrenan en ningún otro sitio pese a que el Módulo 0 las enseña.
export const CasePairsSchema = Base.extend({
  type: z.literal("case_pairs"),
  pairs: z
    .array(z.object({ upper: z.string(), lower: z.string() }))
    .min(3)
    .max(6),
});

export type CasePairs = z.infer<typeof CasePairsSchema>;
