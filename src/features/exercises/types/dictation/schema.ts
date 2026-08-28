import { z } from "zod";
import { Base } from "../base";

// Dictado (PLAN.md Fase 5): suena el audio y se escribe con el teclado griego.
// NO necesita IA para corregir — la respuesta esperada se conoce, así que la
// validación es determinista como todo lo demás (regla 1 de AGENTS.md).
//
// Es el tipo más exigente del catálogo: sin texto de apoyo, obliga a decidir la
// ortografía solo con el oído. Ataca η/ι/υ y ο/ω, que suenan igual.
export const DictationSchema = Base.extend({
  type: z.literal("dictation"),
  /** Lo que suena y hay que escribir. */
  answer: z.string(),
  accept: z.array(z.string()).default([]),
  /** Pista en español, visible solo tras el primer intento fallido. */
  meaning: z.string().optional(),
});

export type Dictation = z.infer<typeof DictationSchema>;
