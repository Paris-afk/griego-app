"use client";

import { useMemo } from "react";

import { cn } from "@/shared/lib/utils";
import { GreekKeyboard } from "@/shared/ui";
import type { ExerciseRendererProps } from "../module";
import type { Autocomplete } from "./schema";

// Completar las letras que faltan. Los huecos NO son al azar: el seed los pone
// en η/ι/υ y ο/ω, que son las confusiones reales del hispanohablante
// (contrastive-es-el.csv: confusion_i, confusion_omicron_omega).
//
// El teclado escribe al final, así que los huecos se rellenan en orden de
// izquierda a derecha. Su campo propio va oculto: la palabra con huecos ya es
// el campo, y dos a la vez confundirían.
export function AutocompleteRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<Autocomplete>) {
  const blanks = useMemo(
    () => [...exercise.blanks].sort((a, b) => a - b),
    [exercise.blanks],
  );

  // `value` es la palabra completa (lo que espera el validador). Las letras que
  // el usuario ha escrito se derivan leyendo los huecos de ese valor.
  const full = typeof value === "string" ? value : "";
  const draft = useMemo(
    () => blanks.map((pos) => full[pos] ?? "").join("").trimEnd(),
    [blanks, full],
  );

  function handleDraft(next: string) {
    if (disabled) return;
    const letters = [...next].slice(0, blanks.length);
    const chars = exercise.answer.split("");
    blanks.forEach((pos, i) => {
      chars[pos] = letters[i] ?? " ";
    });
    onChange(chars.join(""));
  }

  const activeBlank = Math.min(draft.length, blanks.length - 1);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] text-[var(--color-text-soft)]">
        Completa las letras que faltan.
      </p>

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {exercise.answer.split("").map((ch, i) => {
            const blankIdx = blanks.indexOf(i);
            if (blankIdx === -1) {
              return (
                <span
                  key={i}
                  className="font-greek text-[38px] font-medium leading-none text-[var(--color-text)]"
                >
                  {ch}
                </span>
              );
            }
            const typedChar = draft[blankIdx] ?? "";
            return (
              <span
                key={i}
                className={cn(
                  "flex h-[54px] min-w-[44px] items-center justify-center rounded-[8px] border-2 px-1",
                  typedChar
                    ? "border-[var(--color-primary)] bg-[#F6E8DF]"
                    : blankIdx === activeBlank && !disabled
                      ? "border-[var(--color-primary)] bg-[var(--color-surface)]"
                      : "border-dashed border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <span className="font-greek text-[32px] font-medium leading-none text-[var(--color-text)]">
                  {typedChar}
                </span>
              </span>
            );
          })}
        </div>
        <span className="font-display text-[17px] italic text-[var(--color-text-soft)]">
          {exercise.meaning}
        </span>
      </div>

      <GreekKeyboard
        value={draft}
        onChange={handleDraft}
        disabled={disabled}
        hideInput
      />
    </div>
  );
}
