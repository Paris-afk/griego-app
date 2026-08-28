import type { ValidationResult } from "../module";
import type { SpeedRound } from "./schema";

// El input es la lista de respuestas (true/false o null si se agotó el tiempo).
// Se aprueba con 70% o más: la ronda rápida entrena automatismo, y exigir el
// 100% bajo cronómetro castigaría en vez de presionar (EXERCISES.md §3.5).
export const SPEED_ROUND_PASS_RATIO = 0.7;

export function validateSpeedRound(
  exercise: SpeedRound,
  input: unknown,
): ValidationResult {
  const answers = Array.isArray(input) ? input : [];
  const hits = exercise.claims.filter((c, i) => answers[i] === c.isTrue).length;
  const ratio = exercise.claims.length ? hits / exercise.claims.length : 0;
  return {
    isCorrect: ratio >= SPEED_ROUND_PASS_RATIO,
    errorTags: [],
    correct: `${hits}/${exercise.claims.length}`,
  };
}
