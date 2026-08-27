import type { ValidationResult } from "../module";
import type { ReadingComprehension } from "./schema";

// Fase 7. La validación de comprensión lectora se implementa con la mecánica
// de lectura (opción múltiple por pregunta). Placeholder determinista por ahora.
export function validateReadingComprehension(
  _exercise: ReadingComprehension,
  _input: unknown,
): ValidationResult {
  return { isCorrect: false, errorTags: [], correct: undefined };
}
