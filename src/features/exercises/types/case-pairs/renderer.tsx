"use client";

import { useMemo, useState } from "react";

import { cn } from "@/shared/lib/utils";
import type { ExerciseRendererProps } from "../module";
import type { CasePairs } from "./schema";

// Unir mayúscula↔minúscula. Cubre el hueco de la Fase 4: el teclado en pantalla
// solo produce minúsculas, así que las mayúsculas no se entrenan en ningún otro
// sitio — pese a que el Módulo 0 las enseña y Καλημέρα/Δευτέρα van capitalizadas.
function rotate<T>(items: T[], by: number): T[] {
  if (items.length === 0) return items;
  const k = ((by % items.length) + items.length) % items.length;
  return [...items.slice(k), ...items.slice(0, k)];
}

export function CasePairsRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<CasePairs>) {
  const matched = useMemo(
    () => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []),
    [value],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const lowers = useMemo(
    () => rotate(exercise.pairs.map((p) => p.lower), Math.ceil(exercise.pairs.length / 2)),
    [exercise.pairs],
  );

  function tapLower(lower: string) {
    if (disabled || !picked) return;
    const pair = exercise.pairs.find((p) => p.upper === picked);
    if (pair && pair.lower === lower) {
      onChange([...matched, pair.upper]);
      setPicked(null);
    } else {
      setWrong(lower);
      setTimeout(() => setWrong(null), 400);
      setPicked(null);
    }
  }

  const lowerDone = new Set(
    exercise.pairs.filter((p) => matched.includes(p.upper)).map((p) => p.lower),
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-[var(--color-text-soft)]">
        Une cada mayúscula con su minúscula.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {exercise.pairs.map((pair) => {
            const done = matched.includes(pair.upper);
            const active = picked === pair.upper;
            return (
              <button
                key={pair.upper}
                type="button"
                disabled={disabled || done}
                onClick={() => setPicked((p) => (p === pair.upper ? null : pair.upper))}
                className={cn(
                  "flex min-h-[56px] items-center justify-center rounded-[10px] border transition-all",
                  done && "border-[var(--color-success)] bg-[#EAF0E4] opacity-50",
                  !done && active && "border-[1.5px] border-[var(--color-primary)] bg-[#F6E8DF]",
                  !done && !active && "border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <span className="font-greek text-[28px] font-medium text-[var(--color-text)]">
                  {pair.upper}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {lowers.map((lower) => {
            const done = lowerDone.has(lower);
            return (
              <button
                key={lower}
                type="button"
                disabled={disabled || done}
                onClick={() => tapLower(lower)}
                className={cn(
                  "flex min-h-[56px] items-center justify-center rounded-[10px] border transition-all",
                  done && "border-[var(--color-success)] bg-[#EAF0E4] opacity-50",
                  !done && wrong === lower && "border-[1.5px] border-[var(--color-error)] bg-[#F7E4DF]",
                  !done && wrong !== lower && "border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <span className="font-greek text-[28px] text-[var(--color-text)]">
                  {lower}
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
