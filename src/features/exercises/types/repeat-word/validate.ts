import type { ValidationResult } from "../module";
import type { RepeatWord } from "./schema";

// Fase 8 — requiere STT (provocador de pronunciación). Sin audio no hay nada
// que validar de forma determinista; placeholder.
export function validateRepeatWord(
  exercise: RepeatWord,
  _input: unknown,
): ValidationResult {
  return { isCorrect: false, errorTags: [], correct: exercise.target };
}
