"use client";

import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { audioPathForText } from "@/shared/lib/audio";
import { playWord } from "@/shared/lib/sound";
import type { ExerciseRendererProps } from "../module";
import type { MemoryGrid } from "./schema";

interface Card {
  id: string;
  /** Clave de la pareja (el término griego). */
  pair: string;
  face: string;
  isGreek: boolean;
}

// Reparto determinista (sin Math.random) para que servidor y cliente coincidan.
function deal(pairs: MemoryGrid["pairs"]): Card[] {
  const cards: Card[] = [];
  pairs.forEach((p) => {
    cards.push({ id: `g-${p.greek}`, pair: p.greek, face: p.greek, isGreek: true });
    cards.push({ id: `m-${p.greek}`, pair: p.greek, face: p.match, isGreek: false });
  });
  // Intercalado fijo: parte por la mitad y alterna, así las parejas no quedan
  // adyacentes pero el orden es reproducible.
  const half = Math.ceil(cards.length / 2);
  const a = cards.slice(0, half);
  const b = cards.slice(half);
  const out: Card[] = [];
  for (let i = 0; i < half; i++) {
    if (b[i]) out.push(b[i]);
    if (a[i]) out.push(a[i]);
  }
  return out;
}

export function MemoryGridRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<MemoryGrid>) {
  const cards = useMemo(() => deal(exercise.pairs), [exercise.pairs]);
  const solved = useMemo(
    () => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []),
    [value],
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function flip(card: Card) {
    if (disabled || busy) return;
    if (solved.includes(card.pair) || flipped.includes(card.id)) return;

    if (card.isGreek && exercise.withAudio) playWord(audioPathForText(card.pair));

    const next = [...flipped, card.id];
    if (next.length < 2) {
      setFlipped(next);
      return;
    }

    const [firstId] = next;
    const first = cards.find((c) => c.id === firstId);
    setFlipped(next);
    setBusy(true);

    if (first && first.pair === card.pair && first.id !== card.id) {
      setTimeout(() => {
        onChange([...solved, card.pair]);
        setFlipped([]);
        setBusy(false);
      }, 350);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setBusy(false);
      }, 750);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-[var(--color-text-soft)]">
        Encuentra las {exercise.pairs.length} parejas.
      </p>

      {/* 3 columnas a propósito: en 390px con márgenes quedan ~110px por carta,
          con sitio para leer griego. Con 4 columnas serían 80px. */}
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((card) => {
          const isSolved = solved.includes(card.pair);
          const isUp = isSolved || flipped.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              disabled={disabled || isSolved}
              onClick={() => flip(card)}
              aria-label={isUp ? card.face : "Carta boca abajo"}
              className={cn(
                "flex aspect-square items-center justify-center rounded-[10px] border p-1.5 text-center transition-all",
                isSolved && "border-[var(--color-success)] bg-[#EAF0E4] opacity-45",
                !isSolved && isUp && "border-[1.5px] border-[var(--color-primary)] bg-[#F6E8DF]",
                !isSolved && !isUp && "border-[var(--color-border)] bg-[#EFE7DC]",
              )}
            >
              {isUp ? (
                card.isGreek && exercise.withAudio ? (
                  <Volume2 width={22} height={22} className="text-[var(--color-primary)]" aria-hidden />
                ) : (
                  <span
                    className={cn(
                      "leading-tight",
                      card.isGreek
                        ? "font-greek text-[17px] text-[var(--color-text)]"
                        : "font-display text-[15px] text-[var(--color-text)]",
                    )}
                  >
                    {card.face}
                  </span>
                )
              ) : (
                <span className="font-display text-[20px] text-[#B3A695]" aria-hidden>
                  ;
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-[13px] text-[var(--color-text-soft)]">
        {solved.length} de {exercise.pairs.length}
      </p>
    </div>
  );
}
