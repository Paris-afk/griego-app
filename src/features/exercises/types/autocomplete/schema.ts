import { z } from "zod";
import { Base } from "../base";

// Completar las letras que faltan (EXERCISES.md §3.4). Los huecos NO son al
// azar: caen en η/ι/υ y ο/ω, que son las confusiones reales del hispanohablante.
export const AutocompleteSchema = Base.extend({
  type: z.literal("autocomplete"),
  /** Palabra completa (la respuesta). */
  answer: z.string(),
  /** Índices (0-based) de las letras ocultas. */
  blanks: z.array(z.number().int().nonnegative()).min(1),
  meaning: z.string(),
});

export type Autocomplete = z.infer<typeof AutocompleteSchema>;
