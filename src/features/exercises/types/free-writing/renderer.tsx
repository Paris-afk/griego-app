"use client";

import { GreekKeyboard } from "@/shared/ui";
import type { ExerciseRendererProps } from "../module";
import type { FreeWriting } from "./schema";

// Escritura libre en griego (Fase 5 añade el profesor IA al feedback).
export function FreeWritingRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<FreeWriting>) {
  const text = typeof value === "string" ? value : "";

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center font-display text-[26px] font-medium leading-relaxed text-[var(--color-text)]">
        {exercise.prompt.text}
      </p>
      <GreekKeyboard
        value={text}
        onChange={(next) => onChange(next)}
        placeholder="Escribe en griego…"
        disabled={disabled}
      />
    </div>
  );
}
