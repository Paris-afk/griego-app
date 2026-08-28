"use client";

import { useMemo } from "react";

import { cn } from "@/shared/lib/utils";
import type { ExerciseRendererProps } from "../module";
import type { GenderSort } from "./schema";

const ARTICLES = ["ο", "η", "το"] as const;
const LABELS: Record<(typeof ARTICLES)[number], string> = {
  ο: "masculino",
  η: "femenino",
  το: "neutro",
};

// Tres botones al ancho completo, NO tres columnas para arrastrar: en 390px
// las columnas darían celdas de ~110px, incómodas y pequeñas para leer griego.
// Además el drag compite con el scroll en móvil (EXERCISES.md §5, regla 3).
export function GenderSortRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<GenderSort>) {
  const picked = useMemo(
    () => ((value ?? {}) as Record<string, string>),
    [value],
  );

  const currentIndex = exercise.items.findIndex((it) => !picked[it.word]);
  const current = currentIndex === -1 ? null : exercise.items[currentIndex];
  const answered = exercise.items.length - (currentIndex === -1 ? 0 : exercise.items.length - currentIndex);

  function choose(article: string) {
    if (disabled || !current) return;
    onChange({ ...picked, [current.word]: article });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[15px] text-[var(--color-text-soft)]">
        ¿Qué artículo lleva esta palabra?
      </p>

      <div className="flex min-h-[92px] flex-col items-center justify-center gap-2">
        {current ? (
          <span className="font-greek text-[46px] font-medium leading-[1.15] tracking-[-0.5px] text-[var(--color-text)]">
            {current.word}
          </span>
        ) : (
          <span className="font-display text-[21px] text-[var(--color-success)]">
            Todas clasificadas
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {ARTICLES.map((article) => (
          <button
            key={article}
            type="button"
            disabled={disabled || !current}
            onClick={() => choose(article)}
            className={cn(
              "flex min-h-[56px] items-center justify-between rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 transition-colors",
              !disabled && current && "hover:border-[var(--color-primary)]",
              (disabled || !current) && "opacity-50",
            )}
          >
            <span className="font-greek text-[24px] font-medium text-[var(--color-text)]">
              {article}
            </span>
            <span className="text-[13px] text-[var(--color-text-soft)]">
              {LABELS[article]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {exercise.items.map((item, i) => (
          <span
            key={item.word}
            className={cn(
              "h-1.5 rounded-full transition-all",
              picked[item.word] ? "w-5 bg-[var(--color-primary)]" : "w-1.5 bg-[var(--color-border)]",
              i === currentIndex && "w-5 bg-[var(--color-text-soft)]",
            )}
          />
        ))}
      </div>
      <span className="sr-only">
        {answered} de {exercise.items.length} clasificadas
      </span>
    </div>
  );
}
