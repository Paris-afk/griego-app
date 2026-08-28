import { compareText } from "../../normalize";
import type { ValidationResult } from "../module";
import type { Dictation } from "./schema";

// Determinista: `compareText` ya cubre la normalización NFD, las variantes de
// `accept[]`, σ↔ς final y los teclazos. Encima añadimos las etiquetas propias
// del dictado: qué letra ambigua se confundió al oírla.
export function validateDictation(
  exercise: Dictation,
  input: unknown,
): ValidationResult {
  const typed = typeof input === "string" ? input.trim() : "";
  const base = compareText(exercise.answer, exercise.accept, typed);
  const tags = [...base.errorTags];

  // Solo tiene sentido comparar letra a letra si la longitud coincide; si no,
  // el error es de otra clase (falta una letra, sobra otra) y `compareText` ya
  // lo describe.
  if (!base.isCorrect && Array.from(typed).length === Array.from(exercise.answer).length) {
    const got = Array.from(typed);
    const want = Array.from(exercise.answer);
    for (let i = 0; i < want.length; i++) {
      if (got[i] === want[i]) continue;
      if ("ηιυ".includes(want[i]) && "ηιυ".includes(got[i])) tags.push("confusion_i");
      else if ("οω".includes(want[i]) && "οω".includes(got[i])) tags.push("confusion_omicron_omega");
    }
  }

  return {
    isCorrect: base.isCorrect,
    errorTags: [...new Set(tags)],
    correct: exercise.answer,
  };
}
