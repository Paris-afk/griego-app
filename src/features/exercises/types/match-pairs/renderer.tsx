"use client";

import { useMemo, useState } from "react";

import { cn } from "@/shared/lib/utils";
import { audioPathForText } from "@/shared/lib/audio";
import { playWord } from "@/shared/lib/sound";
import type { ExerciseRendererProps } from "../module";
import type { MatchPairs } from "./schema";

// Barajado determinista por índice: sin Math.random, para que el render del
// servidor y el del cliente coincidan (si no, hydration mismatch).
function rotate<T>(items: T[], by: number): T[] {
  if (items.length === 0) return items;
  const k = ((by % items.length) + items.length) % items.length;
  return [...items.slice(k), ...items.slice(0, k)];
}

export function MatchPairsRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<MatchPairs>) {
  const matched = useMemo(
    () => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []),
    [value],
  );
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  // La columna derecha va rotada para que las parejas no queden enfrentadas.
  const rights = useMemo(
    () => rotate(exercise.pairs.map((p) => p.right), Math.ceil(exercise.pairs.length / 2)),
    [exercise.pairs],
  );

  function tapLeft(left: string) {
    if (disabled || matched.includes(left)) return;
    setWrong(null);
    setPickedLeft((prev) => (prev === left ? null : left));
  }

  function tapRight(right: string) {
    if (disabled || !pickedLeft) return;
    const pair = exercise.pairs.find((p) => p.left === pickedLeft);
    if (pair && pair.right === right) {
      if (exercise.withAudio) playWord(audioPathForText(pair.left));
      onChange([...matched, pair.left]);
      setPickedLeft(null);
    } else {
      setWrong(right);
      setTimeout(() => setWrong(null), 400);
      setPickedLeft(null);
    }
  }

  const rightDone = new Set(
    exercise.pairs.filter((p) => matched.includes(p.left)).map((p) => p.right),
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-[var(--color-text-soft)]">
        Toca una palabra de cada lado para unirlas.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {exercise.pairs.map((pair) => {
            const done = matched.includes(pair.left);
            const active = pickedLeft === pair.left;
            return (
              <button
                key={pair.left}
                type="button"
                disabled={disabled || done}
                onClick={() => tapLeft(pair.left)}
                className={cn(
                  "flex min-h-[56px] items-center justify-center rounded-[10px] border px-3 text-center transition-all",
                  done && "border-[var(--color-success)] bg-[#EAF0E4] opacity-50",
                  !done && active && "border-[1.5px] border-[var(--color-primary)] bg-[#F6E8DF]",
                  !done && !active && "border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <span className="font-greek text-[19px] text-[var(--color-text)]">
                  {pair.left}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {rights.map((right) => {
            const done = rightDone.has(right);
            return (
              <button
                key={right}
                type="button"
                disabled={disabled || done}
                onClick={() => tapRight(right)}
                className={cn(
                  "flex min-h-[56px] items-center justify-center rounded-[10px] border px-3 text-center transition-all",
                  done && "border-[var(--color-success)] bg-[#EAF0E4] opacity-50",
                  !done && wrong === right && "border-[1.5px] border-[var(--color-error)] bg-[#F7E4DF]",
                  !done && wrong !== right && "border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <span className="font-display text-[18px] text-[var(--color-text)]">
                  {right}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[13px] text-[var(--color-text-soft)]">
        {matched.length} de {exercise.pairs.length}
      </p>
    </div>
  );
}
