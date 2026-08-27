import type { ValidationResult } from "../module";
import type { MultipleChoice } from "./schema";

// Opción elegida por el usuario. Comparación exacta (los options son literales).
export function validateMultipleChoice(
  exercise: MultipleChoice,
  input: unknown,
): ValidationResult {
  const picked = typeof input === "string" ? input : "";
  return {
    isCorrect: picked === exercise.answer,
    errorTags: [],
    correct: exercise.answer,
  };
}
