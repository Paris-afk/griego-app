import { compareText } from "../../normalize";
import type { ValidationResult } from "../module";
import type { AlphabetDrill } from "./schema";

export function validateAlphabetDrill(
  exercise: AlphabetDrill,
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
