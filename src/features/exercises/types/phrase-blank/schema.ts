import { z } from "zod";
import { Base } from "../base";

// Completar UNA palabra dentro de una frase.
//
// Existe porque pedir «escribe Πώς σε λένε;» con teclado en pantalla en la
// primera lección es demasiado: son 11 pulsaciones sin haber interiorizado
// todavía el alfabeto. Aquí la frase se muestra entera y solo falta una pieza,
// que es como se aprende una expresión: reconociéndola antes de producirla.
export const PhraseBlankSchema = Base.extend({
  type: z.literal("phrase_blank"),
  /** Palabras de la frase, en orden. */
  words: z.array(z.string()).min(2),
  /** Índice (0-based) de la palabra que se oculta. */
  blankIndex: z.number().int().nonnegative(),
  /** La frase completa — se compara contra ella tras rellenar el hueco. */
  answer: z.string(),
  meaning: z.string(),
  /** Opciones a elegir; si va vacío, se escribe con el teclado. */
  options: z.array(z.string()).default([]),
});

export type PhraseBlank = z.infer<typeof PhraseBlankSchema>;
