"use client";

import { GreekKeyboard } from "@/shared/ui";
import type { ExerciseRendererProps } from "../module";
import type { Translation } from "./schema";

const DISPLAY_CHARS = /^[\p{Script=Greek}\s;,]+$/u;

// Escribir la traducción en griego se hace con el teclado griego en pantalla.
export function TranslationRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<Translation>) {
  const isGreek = DISPLAY_CHARS.test(exercise.prompt.text);
  const text = typeof value === "string" ? value : "";

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

      <GreekKeyboard
        value={text}
        onChange={(next) => onChange(next)}
        placeholder="Escribe en griego…"
        disabled={disabled}
      />
    </div>
  );
}
