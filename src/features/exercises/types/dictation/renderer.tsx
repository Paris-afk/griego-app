"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";

import { AudioButton, GreekKeyboard } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import type { ExerciseRendererProps } from "../module";
import type { Dictation } from "./schema";

// Dictado: sin texto de apoyo. La traducción existe pero está OCULTA tras un
// botón — si se mostrara de entrada, el ejercicio dejaría de ser de oído y
// pasaría a ser una traducción más.
export function DictationRenderer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseRendererProps<Dictation>) {
  const typed = typeof value === "string" ? value : "";
  // Escalera de dificultad (EXERCISES.md §5):
  //  · fácil   → la traducción se ve de entrada (andamiaje)
  //  · medio   → está, pero hay que pedirla
  //  · difícil → no hay pista: solo el oído
  const hintMode =
    exercise.difficulty === "easy"
      ? "visible"
      : exercise.difficulty === "medium"
        ? "onDemand"
        : "hidden";
  const [showHint, setShowHint] = useState(hintMode === "visible");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <AudioButton src={audioPathForText(exercise.answer)} size="lg" />
        <span className="text-[13px] text-[var(--color-text-soft)]">
          Escucha y escribe lo que oyes
        </span>

        {exercise.meaning && hintMode !== "hidden" &&
          (showHint ? (
            <span className="font-display text-[17px] italic text-[var(--color-text-soft)]">
              {exercise.meaning}
            </span>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowHint(true)}
              className="flex min-h-[44px] items-center gap-1.5 px-2 text-[13px] font-semibold text-[var(--color-primary)]"
            >
              <Lightbulb width={15} height={15} strokeWidth={2} aria-hidden />
              Ver la traducción
            </button>
          ))}
      </div>

      <GreekKeyboard
        value={typed}
        onChange={onChange}
        placeholder="Escribe lo que escuchas…"
        disabled={disabled}
      />
    </div>
  );
}
