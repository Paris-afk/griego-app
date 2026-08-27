import type { ComponentType } from "react";
import type { z } from "zod";

import type { Exercise, ExerciseType } from "../schemas";

// Contrato de un tipo de ejercicio (patrón 1 de ARCHITECTURE.md §3.2).
// Las tres piezas — schema + Renderer + validate — viven juntas por tipo.

export interface ValidationResult {
  isCorrect: boolean;
  errorTags: string[];
  /** La respuesta canónica correcta, para mostrarla en el feedback. */
  correct?: string;
}

export interface ExerciseRendererProps<X> {
  exercise: X;
  /** Valor actual del input (lo que reporta el usuario). El player lo posee. */
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

export interface ExerciseModule<T extends ExerciseType> {
  type: T;
  schema: z.ZodType<Extract<Exercise, { type: T }>>;
  Renderer: ComponentType<ExerciseRendererProps<Extract<Exercise, { type: T }>>>;
  /** Validación determinista (servidor). Nunca decide la IA (regla 1). */
  validate: (
    exercise: Extract<Exercise, { type: T }>,
    input: unknown,
  ) => ValidationResult;
}

// Mapa completo por tipo. `Record` así falla en compilación si falta un tipo
// (patrón 1 de §3.2: el registro es el único índice de la lista de tipos).
export type ExerciseModules = { [K in ExerciseType]: ExerciseModule<K> };
