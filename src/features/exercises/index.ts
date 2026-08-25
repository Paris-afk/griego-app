// API pública del feature exercises — EL MOTOR (ARCHITECTURE.md §3.1, patrón 1).
// En esta fase expone el contrato (schemas) y la normalización. Renderers y
// validadores llegan en la Fase 3 dentro de types/<tipo>.tsx + registry.ts.

export { ExerciseSchema } from "./schemas";
export type { Exercise, ExerciseType, ExerciseTypeList } from "./schemas";
export { normalizeForComparison, stripDiacritics } from "./normalize";
