import { z } from "zod";
import { Base } from "../base";

// Tarjeta de regla (EXERCISES.md §3.1). No puntúa: enseña ANTES de ejercitar.
// Es la respuesta al problema de Duolingo — saber qué regla estás practicando.
export const ConceptSchema = Base.extend({
  type: z.literal("concept"),
  title: z.string(),
  body: z.string(),
  /** Puente contrastivo es→el: campo `bridge_language` de contrastive-es-el.csv. */
  bridge: z.string().optional(),
  points: z.number().int().min(0).default(0),
});

export type Concept = z.infer<typeof ConceptSchema>;
