import type { ValidationResult } from "../module";
import type { OrderWords } from "./schema";

// Secuencia de palabras elegida por el usuario (string[]). Comparación exacta
// de la secuencia canónica.
export function validateOrderWords(
  exercise: OrderWords,
  input: unknown,
): ValidationResult {
  const sequence = Array.isArray(input) ? input.map(String) : [];
  const isCorrect =
    sequence.length === exercise.answer.length &&
    sequence.every((word, i) => word === exercise.answer[i]);
  return {
    isCorrect,
    errorTags: [],
    correct: exercise.answer.join(" "),
  };
}
