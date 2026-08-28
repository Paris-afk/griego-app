import type { ValidationResult } from "../module";
import type { MatchPairs } from "./schema";

// El renderer solo permite cerrar parejas correctas, así que "resuelto" es
// haberlas emparejado todas. El input es la lista de `left` ya emparejados.
export function validateMatchPairs(
  exercise: MatchPairs,
  input: unknown,
): ValidationResult {
  const done = Array.isArray(input) ? input.filter((x): x is string => typeof x === "string") : [];
  const expected = exercise.pairs.map((p) => p.left);
  const isCorrect = expected.every((l) => done.includes(l));
  return {
    isCorrect,
    errorTags: [],
    correct: expected.join(" · "),
  };
}
