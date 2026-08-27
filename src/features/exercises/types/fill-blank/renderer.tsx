"use client";

import type { ExerciseRendererProps } from "../module";
import type { FillBlank } from "./schema";

export function FillBlankRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<FillBlank>) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-display text-[26px] font-medium leading-relaxed text-[var(--color-text)]">
        {exercise.prompt.text}
      </p>

      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={2}
        autoFocus
        className="min-h-[72px] w-full resize-none rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center font-greek text-[22px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        placeholder="Completa aquí…"
      />
    </div>
  );
}
