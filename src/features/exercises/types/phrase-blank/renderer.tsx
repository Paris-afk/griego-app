"use client";

import { cn } from "@/shared/lib/utils";
import { AudioButton, GreekKeyboard } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import type { ExerciseRendererProps } from "../module";
import type { PhraseBlank } from "./schema";

// La frase se ve entera y solo falta una palabra. Con `options` se elige entre
// varias (el paso más suave); sin ellas se escribe con el teclado griego.
export function PhraseBlankRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<PhraseBlank>) {
  const typed = typeof value === "string" ? value : "";
  const hasOptions = exercise.options.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-3">
          {exercise.words.map((word, i) =>
            i === exercise.blankIndex ? (
              <span
                key={i}
                className={cn(
                  "inline-flex min-h-[48px] min-w-[84px] items-center justify-center rounded-[8px] border-2 px-3",
                  typed
                    ? "border-[var(--color-primary)] bg-[#F6E8DF]"
                    : "border-dashed border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <span className="font-greek text-[28px] font-medium leading-none text-[var(--color-text)]">
                  {typed}
                </span>
              </span>
            ) : (
              <span
                key={i}
                className="font-greek text-[30px] font-medium leading-none text-[var(--color-text)]"
              >
                {word}
              </span>
            ),
          )}
        </div>

        <span className="font-display text-[17px] italic text-[var(--color-text-soft)]">
          {exercise.meaning}
        </span>

        <AudioButton src={audioPathForText(exercise.answer)} />
      </div>

      {hasOptions ? (
        <div className="flex flex-col gap-3">
          {exercise.options.map((option) => {
            const active = option === typed;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onChange(option)}
                className={cn(
                  "flex min-h-[56px] items-center justify-center rounded-[10px] border px-4 transition-colors",
                  active
                    ? "border-[1.5px] border-[var(--color-primary)] bg-[#F6E8DF]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]",
                  disabled && "pointer-events-none",
                )}
              >
                <span className="font-greek text-[22px] text-[var(--color-text)]">
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <GreekKeyboard
          value={typed}
          onChange={onChange}
          placeholder="Escribe la palabra que falta…"
          disabled={disabled}
          hideInput
        />
      )}
    </div>
  );
}
