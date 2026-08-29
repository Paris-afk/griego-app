"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { AudioButton, VocabImage } from "@/shared/ui";
import type { VocabCard } from "../queries";

// Tarjetas de vocabulario de un grupo. Se puede ocultar la traducción para
// autoevaluarse: sin eso sería una lista, no un repaso.
export function VocabCardList({ cards }: { cards: VocabCard[] }) {
  const [hidden, setHidden] = useState(false);

  if (cards.length === 0) {
    return (
      <p className="text-[15px] text-[var(--color-text-soft)]">
        Este grupo todavía no tiene palabras.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setHidden((h) => !h)}
        className="flex min-h-[44px] items-center justify-center gap-2 self-start rounded-pill border border-[var(--color-border)] px-4 text-[13px] font-semibold text-[var(--color-primary-strong)]"
      >
        {hidden ? <Eye width={15} height={15} aria-hidden /> : <EyeOff width={15} height={15} aria-hidden />}
        {hidden ? "Mostrar traducciones" : "Ocultar traducciones"}
      </button>

      <ul className="flex flex-col gap-2.5">
        {cards.map((card) => (
          <li
            key={card.term}
            className="flex items-center gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
          >
            <VocabImage
              imageUrl={card.imageUrl}
              emoji={card.emoji}
              alt={card.translation}
              size="sm"
            />

            <div className="flex flex-grow flex-col gap-0.5">
              <span className="font-greek text-[20px] text-[var(--color-text)]">
                {card.term}
              </span>
              <span
                className={cn(
                  "text-[13px] transition-opacity",
                  hidden
                    ? "select-none opacity-0"
                    : "opacity-100 text-[var(--color-text-soft)]",
                )}
                aria-hidden={hidden}
              >
                {card.translation}
                {card.transliteration ? ` · ${card.transliteration}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-1" aria-label={`Dominio ${card.mastery} de 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={
                    i < card.mastery
                      ? "h-1.5 w-2 rounded-full bg-[var(--color-secondary)]"
                      : "h-1.5 w-2 rounded-full bg-[var(--color-border)]"
                  }
                />
              ))}
            </div>

            {card.audioUrl && <AudioButton src={card.audioUrl} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
