"use client";

import type { ExerciseRendererProps } from "../module";
import type { RepeatWord } from "./schema";

// Fase 8 — pronunciación hablada (requiere STT).
export function RepeatWordRenderer({
  exercise,
  value: _value,
  onChange: _onChange,
  disabled: _disabled,
}: ExerciseRendererProps<RepeatWord>) {
  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-center font-greek text-[42px] font-medium text-[var(--color-text)]">
        {exercise.target}
      </p>
      <p className="mt-3 text-center text-[13px] text-[var(--color-text-soft)]">
        La pronunciación se implementa en la Fase 8.
      </p>
    </div>
  );
}
