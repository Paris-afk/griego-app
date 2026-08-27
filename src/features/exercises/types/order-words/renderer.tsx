"use client";

import type { ExerciseRendererProps } from "../module";
import type { OrderWords } from "./schema";

export function OrderWordsRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<OrderWords>) {
  const chosen = Array.isArray(value) ? value.map(String) : [];

  const append = (word: string) => onChange([...chosen, word]);
  const removeAt = (index: number) =>
    onChange(chosen.filter((_, i) => i !== index));

  // Reconstrucción del pool respetando la cantidad de ocurrencias de cada palabra.
  const pool = exercise.words.filter((word) => {
    const occurrences = exercise.words.filter((w) => w === word).length;
    const picked = chosen.filter((c) => c === word).length;
    return picked < occurrences;
  });

  return (
    <div className="flex flex-col gap-5">
      <p className="font-display text-[26px] font-medium leading-relaxed text-[var(--color-text)]">
        {exercise.prompt.text}
      </p>

      {/* Secuencia en construcción */}
      <div className="flex min-h-[64px] flex-wrap items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        {chosen.length === 0 && (
          <span className="px-2 text-[14px] text-[var(--color-text-soft)]">
            Toca las palabras en orden…
          </span>
        )}
        {chosen.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            disabled={disabled}
            onClick={() => removeAt(i)}
            className="rounded-button border border-[var(--color-primary)] bg-[#F6E8DF] px-3 py-2 font-greek text-[16px] font-medium text-[#8E3F1F]"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Pool (clave única por índice: puede haber letras repetidas) */}
      <div className="flex flex-wrap items-center gap-2">
        {pool.map((word, idx) => (
          <button
            key={`${word}-${idx}`}
            type="button"
            disabled={disabled}
            onClick={() => append(word)}
            className="rounded-button border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-greek text-[16px] font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
          >
            {word}
          </button>
        ))}
      </div>

      {chosen.length > 0 && chosen.length === exercise.answer.length && (
        <div className="italic text-[13px] text-[var(--color-text-soft)]">
          Comprueba el orden antes de responder.
        </div>
      )}
    </div>
  );
}
