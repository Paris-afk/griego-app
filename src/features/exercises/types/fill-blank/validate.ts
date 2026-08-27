import { compareText } from "../../normalize";
import type { ValidationResult } from "../module";
import type { FillBlank } from "./schema";

export function validateFillBlank(
  exercise: FillBlank,
  input: unknown,
): ValidationResult {
  const text = typeof input === "string" ? input : "";
  const result = compareText(exercise.answer, exercise.accept, text);
  return {
    isCorrect: result.isCorrect,
    errorTags: result.errorTags,
    correct: exercise.answer,
  };
}
