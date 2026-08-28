"use client";

import type { ExerciseRendererProps } from "../module";
import type { Concept } from "./schema";

// Tarjeta de regla (EXERCISES.md §3.1). No se responde: se lee.
// El bloque contrastivo es lo que diferencia esto de un tooltip genérico —
// conecta la regla griega con lo que el alumno YA sabe del español.
export function ConceptRenderer({ exercise }: ExerciseRendererProps<Concept>) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[10px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
        ANTES DE EMPEZAR
      </span>

      <h2 className="font-display text-[28px] font-medium leading-[1.2] tracking-[-0.2px] text-[var(--color-text)]">
        {exercise.title}
      </h2>

      <p className="text-[17px] leading-[1.55] text-pretty text-[var(--color-text)]">
        {exercise.body}
      </p>

      {exercise.bridge && (
        <div className="flex flex-col gap-2 border-l-2 border-[var(--color-secondary)] bg-[#F4F1E9] px-4 py-3.5">
          <span className="text-[10px] font-semibold tracking-[1.4px] text-[#4E5C33]">
            LO QUE YA SABES DEL ESPAÑOL
          </span>
          <p className="font-display text-[16px] leading-[1.5] text-pretty text-[var(--color-text)]">
            {exercise.bridge}
          </p>
        </div>
      )}
    </div>
  );
}
