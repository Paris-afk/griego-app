"use client";

import { GreekKeyboard } from "@/shared/ui";
import type { ExerciseRendererProps } from "../module";
import type { FillBlank } from "./schema";

export function FillBlankRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<FillBlank>) {
  const text = typeof value === "string" ? value : "";

  return (
    <div className="flex flex-col gap-6">
      <p className="font-display text-[26px] font-medium leading-relaxed text-[var(--color-text)]">
        {exercise.prompt.text}
      </p>

      <GreekKeyboard
        value={text}
        onChange={(next) => onChange(next)}
        placeholder="Completa…"
        disabled={disabled}
      />
    </div>
  );
}
