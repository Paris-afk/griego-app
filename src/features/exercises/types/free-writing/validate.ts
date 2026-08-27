import { compareText } from "../../normalize";
import type { ValidationResult } from "../module";
import type { FreeWriting } from "./schema";

// Si hay respuesta canónica, se valida de forma determinista. Si es abierta
// (sin `answer`), la corrección es de DeepSeek — Fase 5. Aquí no se decide nada.
export function validateFreeWriting(
  exercise: FreeWriting,
  input: unknown,
): ValidationResult {
  const text = typeof input === "string" ? input : "";
  if (exercise.answer) {
    const result = compareText(exercise.answer, exercise.accept, text);
    return {
      isCorrect: result.isCorrect,
      errorTags: result.errorTags,
      correct: exercise.answer,
    };
  }
  return { isCorrect: false, errorTags: [], correct: undefined };
}
