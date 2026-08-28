// API pública del feature exercises — EL MOTOR (ARCHITECTURE.md §3.1, patrón 1).
// Una carpeta por tipo en `types/<tipo>` con schema + Renderer + validate, y
// `registry.ts` como único índice. Validación determinista (§5.3).

export { ExerciseSchema, exerciseTypes } from "./schemas";
export type {
  Exercise,
  ExerciseType,
  ExerciseTypeList,
} from "./schemas";

// Capa PURA (sin React): la usa el servidor y los tests.
export {
  validateExercise,
  exerciseSpokenText,
  isInformationalType,
  INFORMATIONAL_TYPES,
} from "./validators";

// Capa de UI: arrastra los renderers .tsx, solo la necesita el cliente.
export { exerciseRegistry } from "./registry";
export type { ExerciseModules } from "./registry";

export type {
  ExerciseModule,
  ExerciseRendererProps,
  ValidationResult,
} from "./types/module";

export {
  normalizeForComparison,
  stripDiacritics,
  compareText,
  levenshtein,
  countDiacritics,
} from "./normalize";
