import { AlertTriangle, TrendingDown } from "lucide-react";

import { AudioButton } from "@/shared/ui";
import type { ErrorGroup, WeakWord } from "../queries";

// "Dónde fallas" (EXERCISES.md §5). Dos vistas del mismo dato: agrupado por
// TIPO de error —accionable— y la lista de palabras concretas.

const DIFFICULTY_LABEL = {
  easy: "Volverá más fácil",
  medium: "Nivel medio",
  hard: "Volverá más difícil",
} as const;

export function WeakWordsPanel({
  words,
  groups,
}: {
  words: WeakWord[];
  groups: ErrorGroup[];
}) {
  if (words.length === 0 && groups.length === 0) {
    return (
      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-[15px] leading-relaxed text-[var(--color-text)]">
          Todavía no hay nada que repasar. Completa alguna lección y aquí
          aparecerá lo que más te cueste.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[10px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
            DÓNDE FALLAS MÁS
          </h2>
          <div className="flex flex-col gap-2.5">
            {groups.map((group) => (
              <div
                key={group.tag}
                className="flex items-start gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5"
              >
                <AlertTriangle
                  width={17}
                  height={17}
                  className="mt-0.5 shrink-0 text-[var(--color-streak)]"
                  aria-hidden
                />
                <div className="flex flex-grow flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-[17px] text-[var(--color-text)]">
                      {group.label}
                    </span>
                    <span className="shrink-0 font-display text-[17px] font-medium tabular-nums text-[var(--color-error)]">
                      {group.count}
                    </span>
                  </div>
                  {group.examples.length > 0 && (
                    <span className="font-greek text-[14px] text-[var(--color-text-soft)]">
                      {group.examples.join(" · ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {words.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[10px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
            PALABRAS FLOJAS
          </h2>
          <div className="flex flex-col gap-2.5">
            {words.map((word) => (
              <div
                key={word.term}
                className="flex items-center gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <div className="flex flex-grow flex-col gap-0.5">
                  <span className="font-greek text-[20px] text-[var(--color-text)]">
                    {word.term}
                  </span>
                  <span className="text-[13px] text-[var(--color-text-soft)]">
                    {word.translation}
                    {word.transliteration ? ` · ${word.transliteration}` : ""}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {/* El dominio como barras: más legible de un vistazo que un número. */}
                  <div className="flex items-center gap-1" aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={
                          i < word.mastery
                            ? "h-1.5 w-3 rounded-full bg-[var(--color-secondary)]"
                            : "h-1.5 w-3 rounded-full bg-[var(--color-border)]"
                        }
                      />
                    ))}
                  </div>
                  <span className="sr-only">Dominio {word.mastery} de 5.</span>
                  <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-soft)]">
                    <TrendingDown width={11} height={11} aria-hidden />
                    {word.failures} de {word.attempts} · {DIFFICULTY_LABEL[word.difficulty]}
                  </span>
                </div>

                {word.audioUrl && <AudioButton src={word.audioUrl} />}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
