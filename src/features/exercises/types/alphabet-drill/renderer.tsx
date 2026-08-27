"use client";

import { AudioButton } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import type { ExerciseRendererProps } from "../module";
import type { AlphabetDrill } from "./schema";

// Fase 4 añade el teclado griego en pantalla. Aquí: entrada de texto simple.
export function AlphabetDrillRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<AlphabetDrill>) {
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
      <input
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus
        className="h-[56px] w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-center font-greek text-[24px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        placeholder="Letra…"
      />
    </div>
  );
}
