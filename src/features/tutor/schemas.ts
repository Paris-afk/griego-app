import { z } from "zod";

// Contrato de la respuesta de DeepSeek (ARCHITECTURE.md §6.2).
//
// `response_format: json_object` garantiza JSON SINTÁCTICAMENTE válido, no que
// traiga los campos correctos: por eso este schema es obligatorio sobre la
// respuesta, igual que sobre el `schemaJson` de un ejercicio.
//
// Ojo con lo que NO está aquí: nada de conteos, rachas ni "es la 3ª vez esta
// semana". Esos son hechos contables y los genera el código desde `errorTags`
// (§6.2). Si los generara la IA y se cachearan, en un mes seguirían diciendo lo
// mismo y serían falsos.
export const TutorResponseSchema = z.object({
  /** Qué estuvo mal, en concreto. Vacío si la respuesta era correcta. */
  errors: z
    .array(
      z.object({
        user: z.string(),
        correct: z.string(),
        why: z.string(),
      }),
    )
    .max(4)
    .default([]),
  /** 2-3 frases en español. Es el cuerpo del feedback. */
  explanation: z.string().min(1).max(600),
  /** Una frase de ánimo, sin paternalismo. */
  encouragement: z.string().max(200).default(""),
  /** Consejo accionable, opcional. */
  tip: z.string().max(300).default(""),
});

export type TutorResponse = z.infer<typeof TutorResponseSchema>;
