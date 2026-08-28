"use client";

import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { AudioButton } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import type { ExerciseRendererProps } from "../module";
import type { ListenChoose } from "./schema";

// Oír y elegir. El audio es de la RESPUESTA, y las opciones incluyen
// distractores que suenan igual (νησί / νισί) — así el ejercicio obliga a
// decidir la ortografía de oído, que es la confusión η/ι/υ del par es→el.
export function ListenChooseRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<ListenChoose>) {
  const selected = typeof value === "string" ? value : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <AudioButton src={audioPathForText(exercise.answer)} size="lg" />
        <span className="text-[13px] text-[var(--color-text-soft)]">
          Tócalo las veces que necesites
        </span>
        {exercise.meaning && (
          <span className="font-display text-[18px] italic text-[var(--color-text-soft)]">
            {exercise.meaning}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {exercise.options.map((option) => {
          const active = option === selected;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                "flex min-h-[60px] items-center gap-3.5 rounded-[10px] border px-5 text-left transition-colors",
                active
                  ? "border-[1.5px] border-[var(--color-primary)] bg-[#F6E8DF]"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)]",
                disabled && "pointer-events-none",
              )}
            >
              <span
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full",
                  active ? "bg-[var(--color-primary)]" : "border-2 border-[#CDBCA8]",
                )}
              >
                {active && (
                  <Check width={13} height={13} strokeWidth={3.4} className="text-white" aria-hidden />
                )}
              </span>
              <span className="font-greek text-[22px] text-[var(--color-text)]">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
