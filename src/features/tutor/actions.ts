"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth";
import { ExerciseSchema } from "@/features/exercises";
import { db } from "@/shared/lib/db";

import { askTutor } from "./lib/tutor-client";
import { buildProgressNote, type ProgressNote } from "./lib/progress-note";
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

export async function getTutorFeedback(input: {
  exerciseId: string;
  answer: string;
  errorTags: string[];
}): Promise<TutorFeedback> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new Error("Parámetros inválidos.");

  // El conteo semanal SIEMPRE se calcula, haya IA o no: es lo que hace que el
  // dato sea fresco en vez de una frase cacheada que envejece mal.
  const since = new Date(Date.now() - WEEK_MS);
  const recent = await db.userAnswer.findMany({
    where: { userId: user.id, isCorrect: false, answeredAt: { gte: since } },
    select: { errorTags: true },
  });
  const countsInWeek: Record<string, number> = {};
  for (const row of recent) {
    for (const tag of row.errorTags.split(",").filter(Boolean)) {
      countsInWeek[tag] = (countsInWeek[tag] ?? 0) + 1;
    }
  }
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

  const snapshot = await db.learnerSnapshot.findUnique({ where: { userId: user.id } });
  const profile = await db.profile.findUnique({ where: { userId: user.id } });

  const ctx: LearnerContext = {
    level: "A1",
    masteredCount: snapshot?.masteredCount ?? 0,
    streak: profile?.streak ?? 0,
    recurringErrors: Object.entries(countsInWeek)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
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
