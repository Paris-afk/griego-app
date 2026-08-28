"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth";
import { ExerciseSchema } from "@/features/exercises";
import { isKnownErrorTag } from "@/shared/lib/error-tags";
import { db } from "@/shared/lib/db";

import { askTutor } from "./lib/tutor-client";
import { buildProgressNote, type ProgressNote } from "./lib/progress-note";
import { buildSnapshot } from "./lib/snapshot";
import { checkRateLimit } from "./lib/rate-limit";
import type { LearnerContext } from "./lib/prompt";
import type { TutorResponse } from "./schemas";

// Explicación del profesor, en su propia Server Action y NO dentro de
// `checkAnswer` a propósito (PLAN.md Fase 5, "render en dos tiempos"):
// la corrección determinista se pinta al instante y esto llega después.
// Si se hiciera en la misma llamada, la hoja de feedback se quedaría en blanco
// 1-2 segundos esperando a la API.

// Los tipos donde la IA aporta algo: no hay respuesta única que comparar
// (`free_writing`) o el error ortográfico merece explicación (`dictation`).
// En opción múltiple o traducción se usa la `nota` del contenido, escrita a
// mano, que es mejor y gratis.
const AI_ENABLED_TYPES = new Set(["free_writing", "dictation"]);

const schema = z.object({
  exerciseId: z.string().min(1),
  answer: z.string().max(500),
  errorTags: z.array(z.string().max(60)).max(10),
});

export interface TutorFeedback {
  /** Explicación de DeepSeek. `null` si no aplica o no estuvo disponible. */
  ai: TutorResponse | null;
  /** Hecho contable generado por CÓDIGO, nunca por la IA (§6.2). */
  progress: ProgressNote;
  /** Por qué no hay explicación de IA, para poder decirlo sin inventar. */
  unavailableReason?: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SNAPSHOT_WINDOW_MS = WEEK_MS;

export async function getTutorFeedback(input: {
  exerciseId: string;
  answer: string;
  errorTags: string[];
}): Promise<TutorFeedback> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new Error("Parámetros inválidos.");

  // El conteo semanal SIEMPRE se calcula fresco, haya IA o no: es lo que hace
  // que el dato sea cierto en vez de una frase cacheada que envejece mal.
  //
  // DIRIGIDO a propósito: solo se cuentan los tags de ESTE turno (uno o dos),
  // en vez de traerse todas las respuestas fallidas de la semana y agregarlas
  // en JS. Con el índice (userId, answeredAt) son dos `count` baratos.
  // Seguro con `contains` porque ninguna etiqueta es subcadena de otra —
  // invariante de error-tags.ts, con test que lo comprueba.
  const since = new Date(Date.now() - WEEK_MS);
  const uniqueTags = [...new Set(parsed.data.errorTags)].filter(isKnownErrorTag);
  const counts = await Promise.all(
    uniqueTags.map((tag) =>
      db.userAnswer.count({
        where: {
          userId: user.id,
          isCorrect: false,
          answeredAt: { gte: since },
          errorTags: { contains: tag },
        },
      }),
    ),
  );
  const countsInWeek: Record<string, number> = {};
  uniqueTags.forEach((tag, i) => {
    countsInWeek[tag] = counts[i];
  });
  const progress = buildProgressNote(parsed.data.errorTags, countsInWeek);

  const exercise = await db.exercise.findUnique({
    where: { id: parsed.data.exerciseId },
  });
  if (!exercise) return { ai: null, progress, unavailableReason: "not_found" };

  const schemaParsed = ExerciseSchema.safeParse(exercise.schemaJson);
  if (!schemaParsed.success) {
    return { ai: null, progress, unavailableReason: "invalid_exercise" };
  }
  const ex = schemaParsed.data;

  if (!AI_ENABLED_TYPES.has(ex.type)) {
    return { ai: null, progress, unavailableReason: "type_not_ai" };
  }

  const expected = "answer" in ex && typeof ex.answer === "string" ? ex.answer : "";

  // Caché por hash(ejercicio, respuesta normalizada): repetir el mismo error no
  // genera una segunda llamada (§6.1).
  const inputHash = `${exercise.id}::${parsed.data.answer.trim().toLowerCase()}`;
  const cached = await db.aiFeedbackCache.findUnique({ where: { inputHash } });
  if (cached) {
    return { ai: cached.responseJson as unknown as TutorResponse, progress };
  }

  // Protege de un bucle accidental que se coma el crédito (ARCHITECTURE.md §8).
  const limit = checkRateLimit(user.id);
  if (!limit.allowed) {
    return { ai: null, progress, unavailableReason: "rate_limited" };
  }

  const [snapshot, profile] = await Promise.all([
    db.learnerSnapshot.findUnique({ where: { userId: user.id } }),
    db.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const ctx: LearnerContext = {
    level: "A1",
    masteredCount: snapshot?.masteredCount ?? 0,
    streak: profile?.streak ?? 0,
    // Del snapshot, no del conteo de este turno: da TONO al prompt y se
    // recalcula al cerrar lección (§6.3). Una lectura por clave única.
    recurringErrors: Array.isArray(snapshot?.recurringErrors)
      ? (snapshot.recurringErrors as { tag: string; count: number }[])
      : [],
    weakLetters: (snapshot?.weakLetters ?? "").split(",").filter(Boolean),
  };

  // El puente contrastivo: la nota del par es→el que casa con el error de este
  // turno. Es lo que hace que la explicación sea la de un profesor que sabe de
  // dónde viene el alumno (CURRICULUM.md §4).
  const notes = parsed.data.errorTags.length
    ? await db.contrastiveNote.findMany({
        where: { course: { isActive: true }, feature: { in: parsed.data.errorTags } },
        select: { bridgeLanguage: true },
      })
    : [];

  const outcome = await askTutor(ctx, {
    instruction: ex.instruction,
    expected,
    userAnswer: parsed.data.answer,
    errorTags: parsed.data.errorTags,
    bridges: notes.map((n) => n.bridgeLanguage),
  });

  if (outcome.status !== "ok") {
    // La app funciona entera sin IA: se cae al feedback fijo del contenido.
    return { ai: null, progress, unavailableReason: outcome.reason };
  }

  await db.aiFeedbackCache.create({
    data: { inputHash, responseJson: outcome.response as never },
  });

  return { ai: outcome.response, progress };
}

// ─────────────────────────────────────────────────────────────────────────────
// Recálculo del LearnerSnapshot (ARCHITECTURE.md §6.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Se llama al cerrar una lección, no en cada respuesta: es un resumen lento y
 * recalcularlo por turno sería caro sin cambiar nada del resultado.
 *
 * Sustituye al escaneo que hacía `getTutorFeedback` en cada fallo.
 */
export async function refreshLearnerSnapshot(userId: string): Promise<void> {
  const since = new Date(Date.now() - SNAPSHOT_WINDOW_MS);

  const [failed, mastered] = await Promise.all([
    db.userAnswer.findMany({
      where: { userId, isCorrect: false, answeredAt: { gte: since } },
      select: { errorTags: true },
    }),
    db.userAnswer.findMany({
      where: { userId, isCorrect: true },
      select: { exerciseId: true },
      distinct: ["exerciseId"],
    }),
  ]);

  const snapshot = buildSnapshot({
    errorTags: failed.flatMap((row) => row.errorTags.split(",").filter(Boolean)),
    masteredCount: mastered.length,
  });

  await db.learnerSnapshot.upsert({
    where: { userId },
    update: {
      recurringErrors: snapshot.recurringErrors,
      weakLetters: snapshot.weakLetters.join(","),
      masteredCount: snapshot.masteredCount,
      summaryText: snapshot.summaryText,
    },
    create: {
      userId,
      recurringErrors: snapshot.recurringErrors,
      weakLetters: snapshot.weakLetters.join(","),
      masteredCount: snapshot.masteredCount,
      summaryText: snapshot.summaryText,
    },
  });
}
