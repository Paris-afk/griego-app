"use client";

import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { AudioButton } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import type { ExerciseRendererProps } from "../module";
import type { MultipleChoice } from "./schema";

export function MultipleChoiceRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<MultipleChoice>) {
  const selected = typeof value === "string" ? value : null;

  return (
    <div className="flex flex-col gap-5">
      {exercise.prompt.text && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center font-greek text-[46px] font-medium leading-[1.15] tracking-[-0.5px] text-[var(--color-text)]">
            {exercise.prompt.text}
          </div>
          <AudioButton src={audioPathForText(exercise.prompt.text)} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {exercise.options.map((option) => {
          const active = option.text === selected;
          return (
            <button
              key={option.text}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.text)}
              className={cn(
                "flex min-h-[60px] items-center gap-3.5 rounded-[10px] border px-5 text-left transition-colors",
                active
                  ? "border-[1.5px] border-[var(--color-primary)] bg-[#F6E8DF]"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]",
                disabled && "pointer-events-none",
              )}
            >
              <span
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full",
                  active
                    ? "bg-[var(--color-primary)]"
                    : "border-2 border-[#CDBCA8]",
                )}
              >
                {active && (
                  <Check width={13} height={13} strokeWidth={3.4} className="text-white" aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  "font-display text-[21px]",
                  active ? "font-semibold text-[#8E3F1F]" : "font-normal text-[var(--color-text)]",
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
