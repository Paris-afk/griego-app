import { normalizeForComparison } from "../../normalize";
import type { ValidationResult } from "../module";
import type { OrderWords } from "./schema";

// Secuencia elegida por el usuario. Se compara NORMALIZADA (sin acentos) por
// coherencia con el resto de tipos: aquí las fichas ya vienen dadas, pero si en
// el futuro se ofrecieran variantes acentuadas, ordenar bien no debe fallar por
// una tilde (ARCHITECTURE.md §5.3).
export function validateOrderWords(
  exercise: OrderWords,
  input: unknown,
): ValidationResult {
  const sequence = Array.isArray(input) ? input.map(String) : [];
  const isCorrect =
    sequence.length === exercise.answer.length &&
    sequence.every(
      (word, i) => normalizeForComparison(word) === normalizeForComparison(exercise.answer[i]),
    );
  return {
    isCorrect,
    errorTags: [],
    correct: exercise.answer.join(" "),
  };
}
