import type { ValidationResult } from "../module";
import type { CasePairs } from "./schema";

export function validateCasePairs(
  exercise: CasePairs,
  input: unknown,
): ValidationResult {
  const done = Array.isArray(input) ? input.filter((x): x is string => typeof x === "string") : [];
  const expected = exercise.pairs.map((p) => p.upper);
  return {
    isCorrect: expected.every((u) => done.includes(u)),
    errorTags: [],
    correct: exercise.pairs.map((p) => `${p.upper}${p.lower}`).join(" · "),
  };
}
