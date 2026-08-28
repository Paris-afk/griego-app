import { compareText } from "../../normalize";
import type { ValidationResult } from "../module";
import type { PhraseBlank } from "./schema";

// Solo se juzga la palabra que faltaba: el resto de la frase la puso el
// ejercicio. Tolerante a acentos como el resto (§5.3).
export function validatePhraseBlank(
  exercise: PhraseBlank,
  input: unknown,
): ValidationResult {
  const typed = typeof input === "string" ? input.trim() : "";
  const expected = exercise.words[exercise.blankIndex] ?? "";
  const base = compareText(expected, [], typed);
  return {
    isCorrect: base.isCorrect,
    errorTags: base.errorTags,
    correct: expected,
  };
}
