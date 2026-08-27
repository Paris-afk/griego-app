"use client";

import type { ExerciseRendererProps } from "../module";
import type { Translation } from "./schema";

const DISPLAY_CHARS = /^[\p{Script=Greek}\s;,]+$/u;

export function TranslationRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<Translation>) {
  const isGreek = DISPLAY_CHARS.test(exercise.prompt.text);

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`text-center ${
          isGreek
            ? "font-greek text-[46px] font-medium leading-[1.15] tracking-[-0.5px] text-[var(--color-text)]"
            : "font-display text-[30px] font-medium leading-tight text-[var(--color-text)]"
        }`}
      >
        {exercise.prompt.text}
      </div>

      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={2}
        autoFocus
        className="min-h-[72px] w-full resize-none rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center font-greek text-[22px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        placeholder="Escribe aquí…"
      />
    </div>
  );
}
