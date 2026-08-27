"use client";

import type { ExerciseRendererProps } from "../module";
import type { ReadingComprehension } from "./schema";

// Fase 7 — lectura con vocabulario tocable y preguntas.
export function ReadingComprehensionRenderer({
  exercise,
  value: _value,
  onChange: _onChange,
  disabled: _disabled,
}: ExerciseRendererProps<ReadingComprehension>) {
  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-[15px] leading-relaxed text-[var(--color-text)]">
        {exercise.prompt.text}
      </p>
      <p className="mt-3 text-[13px] text-[var(--color-text-soft)]">
        La comprensión lectora se implementa en la Fase 7.
      </p>
    </div>
  );
}
