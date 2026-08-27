"use client";

import type { ExerciseRendererProps } from "../module";
import type { FreeWriting } from "./schema";

// Fase 5 integra el profesor IA (feedback). Aquí: escritura libre con teclado.
export function FreeWritingRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<FreeWriting>) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-center font-display text-[26px] font-medium leading-relaxed text-[var(--color-text)]">
        {exercise.prompt.text}
      </p>
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        autoFocus
        className="min-h-[96px] w-full resize-none rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-greek text-[22px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        placeholder="Escribe en griego…"
      />
    </div>
  );
}
