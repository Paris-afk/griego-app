"use client";

import { AudioButton, GreekKeyboard } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import type { ExerciseRendererProps } from "../module";
import type { AlphabetDrill } from "./schema";

// Usa el teclado griego en pantalla (Fase 4) para escribir la letra.
export function AlphabetDrillRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<AlphabetDrill>) {
  const text = typeof value === "string" ? value : "";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <p className="text-center font-greek text-[42px] font-medium leading-tight text-[var(--color-text)]">
          {exercise.letter}
        </p>
        <AudioButton src={audioPathForText(exercise.letter)} />
      </div>
      <p className="text-center font-display text-[18px] italic text-[var(--color-text-soft)]">
        {exercise.prompt.text}
      </p>
      <GreekKeyboard
        value={text}
        onChange={(next) => onChange(next)}
        placeholder="Letra…"
        disabled={disabled}
      />
    </div>
  );
}
