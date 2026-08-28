import type { ValidationResult } from "../module";
import type { MemoryGrid } from "./schema";

// Como en match_pairs, el renderer solo deja cerrar parejas correctas.
export function validateMemoryGrid(
  exercise: MemoryGrid,
  input: unknown,
): ValidationResult {
  const done = Array.isArray(input) ? input.filter((x): x is string => typeof x === "string") : [];
  const expected = exercise.pairs.map((p) => p.greek);
  return {
    isCorrect: expected.every((g) => done.includes(g)),
    errorTags: [],
    correct: expected.join(" · "),
  };
}
