import type { ValidationResult } from "../module";
import type { Concept } from "./schema";

// Informativo: no se puede fallar. Existe para que el reproductor lo trate
// como un paso más de la secuencia sin romper el contrato del motor.
export function validateConcept(_exercise: Concept, _input: unknown): ValidationResult {
  return { isCorrect: true, errorTags: [] };
}
