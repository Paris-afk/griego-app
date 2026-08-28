"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type { ExerciseRendererProps } from "../module";
import type { SpeedRound } from "./schema";

// Ronda rápida ✓/✗ (EXERCISES.md §3.5). Entrena automatismo: saber una palabra
// no sirve si tardas cinco segundos en reconocerla.
//
// El cronómetro PRESIONA pero NO CASTIGA: si se agota, cuenta como fallo y
// pasa a la siguiente. Nunca se pierde la ronda entera por quedarse pensando.
export function SpeedRoundRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<SpeedRound>) {
  const answers = useMemo(
    () => (Array.isArray(value) ? (value as (boolean | null)[]) : []),
    [value],
  );
  const index = answers.length;
  const claim = exercise.claims[index];
  const total = exercise.claims.length;

  const [left, setLeft] = useState(exercise.secondsPerClaim);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (disabled || !claim) return;
    setLeft(exercise.secondsPerClaim);
    const id = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1;
        clearInterval(id);
        // Tiempo agotado: cuenta como fallo (null) y sigue.
        onChange([...answersRef.current, null]);
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
    // `index` reinicia el cronómetro en cada afirmación.
  }, [index, claim, disabled, exercise.secondsPerClaim, onChange]);

  function answer(said: boolean) {
    if (disabled || !claim) return;
    onChange([...answers, said]);
  }

  if (!claim) {
    const hits = exercise.claims.filter((c, i) => answers[i] === c.isTrue).length;
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2">
        <span className="font-display text-[32px] font-medium text-[var(--color-text)]">
          {hits}/{total}
        </span>
        <span className="text-[15px] text-[var(--color-text-soft)]">
          Ronda terminada
        </span>
      </div>
    );
  }

  const urgent = left <= 2;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--color-text-soft)]">
          {index + 1} de {total}
        </span>
        <span
          className={cn(
            "font-display text-[17px] tabular-nums",
            urgent ? "text-[var(--color-error)]" : "text-[var(--color-text-soft)]",
          )}
        >
          {left}s
        </span>
      </div>

      <div className="flex min-h-[130px] flex-col items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6">
        <span className="font-greek text-[34px] font-medium leading-tight text-[var(--color-text)]">
          {claim.greek}
        </span>
        <span className="text-[15px] text-[var(--color-text-soft)]">=</span>
        <span className="font-display text-[22px] text-[var(--color-text)]">
          {claim.spanish}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => answer(false)}
          aria-label="Falso"
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--color-error)] bg-[var(--color-surface)] text-[var(--color-error)]"
        >
          <X width={24} height={24} strokeWidth={2.8} aria-hidden />
          <span className="font-display text-[18px] font-semibold">No</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => answer(true)}
          aria-label="Verdadero"
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--color-success)] bg-[var(--color-surface)] text-[var(--color-success)]"
        >
          <Check width={24} height={24} strokeWidth={2.8} aria-hidden />
          <span className="font-display text-[18px] font-semibold">Sí</span>
        </button>
      </div>
    </div>
  );
}
