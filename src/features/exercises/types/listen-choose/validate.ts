import { normalizeForComparison } from "../../normalize";
import type { ValidationResult } from "../module";
import type { ListenChoose } from "./schema";

// Comparación exacta (las opciones son literales), pero las etiquetas de error
// identifican QUÉ confusión ortográfica hubo: es lo que alimenta el
// LearnerSnapshot y el puente contrastivo del profesor.
export function validateListenChoose(
  exercise: ListenChoose,
  input: unknown,
): ValidationResult {
  const picked = typeof input === "string" ? input : "";
  const isCorrect = picked === exercise.answer;
  const tags: string[] = [];
  if (!isCorrect && picked) {
    // Si solo difieren en diacríticos, el error fue de acento; si suenan igual
    // pero se escriben distinto, es la confusión η/ι/υ u ο/ω.
    if (normalizeForComparison(picked) === normalizeForComparison(exercise.answer)) {
      tags.push("acento_faltante");
    } else {
      if (/[ηιυ]/.test(exercise.answer)) tags.push("confusion_i");
      if (/[οω]/.test(exercise.answer)) tags.push("confusion_omicron_omega");
    }
  }
  return { isCorrect, errorTags: tags, correct: exercise.answer };
}
