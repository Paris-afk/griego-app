import { compareText } from "../../normalize";
import type { ValidationResult } from "../module";
import type { Translation } from "./schema";

export function validateTranslation(
  exercise: Translation,
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
