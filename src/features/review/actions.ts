"use server";

import { db } from "@/shared/lib/db";

import { SM2_INITIAL, nextSm2, qualityFromResult } from "./lib/sm2";

/**
 * Actualiza la cola SM-2 tras responder un ejercicio.
 *
 * Se llama desde `checkAnswer`, no desde el cliente: la programación del
 * repaso es una consecuencia del resultado, no algo que el cliente decida.
 *
 * Silencioso ante errores a propósito: si esto falla, la respuesta del alumno
 * ya está guardada y la lección debe seguir. El repaso es valor añadido, no
 * dato crítico.
 */
export async function recordReview(input: {
  userId: string;
  term: string;
  isCorrect: boolean;
  errorTags: string[];
}): Promise<void> {
  try {
    const entry = await db.vocabularyEntry.findFirst({
      where: { term: input.term },
      select: { id: true },
    });
    if (!entry) return;

    const existing = await db.reviewQueue.findUnique({
      where: {
        userId_vocabularyEntryId: {
          userId: input.userId,
          vocabularyEntryId: entry.id,
        },
      },
    });

    const state = existing
      ? {
          interval: existing.interval,
          easeFactor: existing.easeFactor,
          repetitions: existing.repetitions,
        }
      : SM2_INITIAL;

    // La calidad se DERIVA del resultado: el SM-2 original se la pregunta al
    // usuario, pero interrumpir la lección para eso rompería el ritmo de la
    // Fase 4.5 — y el resultado real es un dato más honesto.
    const next = nextSm2(state, qualityFromResult(input.isCorrect, input.errorTags));

    await db.reviewQueue.upsert({
      where: {
        userId_vocabularyEntryId: {
          userId: input.userId,
          vocabularyEntryId: entry.id,
        },
      },
      update: {
        interval: next.interval,
        easeFactor: next.easeFactor,
        repetitions: next.repetitions,
        dueDate: next.dueDate,
      },
      create: {
        userId: input.userId,
        vocabularyEntryId: entry.id,
        interval: next.interval,
        easeFactor: next.easeFactor,
        repetitions: next.repetitions,
        dueDate: next.dueDate,
      },
    });
  } catch {
    // Ver arriba: nunca debe tumbar la respuesta del alumno.
  }
}
