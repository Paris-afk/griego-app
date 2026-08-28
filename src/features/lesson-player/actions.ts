"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth";
// `validateExercise` sale de la capa pura (validators.ts), no del registro:
// el servidor no debe arrastrar renderers para corregir una respuesta.
import { ExerciseSchema, validateExercise } from "@/features/exercises";
import type { ValidationResult } from "@/features/exercises";
import { refreshLearnerSnapshot } from "@/features/tutor";
import { db } from "@/shared/lib/db";

// Server Actions del reproductor. La validación SIEMPRE es determinista y vive
// en el servidor (regla 3 de AGENTS.md / ARCHITECTURE.md §5.3 y §6.1).

const checkSchema = z.object({
  lessonId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export type CheckAnswerResult = ValidationResult & {
  points: number;
  totalExercises: number;
};

export async function checkAnswer(input: {
  lessonId: string;
  exerciseId: string;
  answer: unknown;
}): Promise<CheckAnswerResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = checkSchema.safeParse(input);
  if (!parsed.success) throw new Error("Parámetros inválidos.");

  const exercise = await db.exercise.findUnique({
    where: { id: parsed.data.exerciseId },
  });
  if (!exercise || exercise.lessonId !== parsed.data.lessonId) {
    throw new Error("Ejercicio no encontrado en esta lección.");
  }

  // Valida el schemaJson contra el contrato y despacha la corrección
  // determinista. La corrección NUNCA la decide la IA (regla 1).
  const exerciseParsed = ExerciseSchema.safeParse(exercise.schemaJson);
  if (!exerciseParsed.success) {
    throw new Error("schemaJson de ejercicio inválido.");
  }

  const result = validateExercise(exerciseParsed.data, input.answer);

  // Puntos solo al primer intento correcto: si el usuario ya respondió este
  // ejercicio antes, un retry vale 0 (obliga a acertar; no se premia el error).
  const priorAnswers = await db.userAnswer.count({
    where: { userId: user.id, exerciseId: exercise.id },
  });
  const points = result.isCorrect && priorAnswers === 0 ? exerciseParsed.data.points : 0;

  await db.userAnswer.create({
    data: {
      userId: user.id,
      exerciseId: exercise.id,
      rawInput: JSON.stringify(input.answer ?? ""),
      isCorrect: result.isCorrect,
      errorTags: result.errorTags.join(","),
      points,
    },
  });

  const totalExercises = await db.exercise.count({
    where: { lessonId: parsed.data.lessonId },
  });

  return { ...result, points, totalExercises };
}

// Marcas la lección como completada al terminar (score acumulado).
export async function completeLesson(lessonId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const score = await db.userAnswer.aggregate({
    where: { userId: user.id, exercise: { lessonId } },
    _sum: { points: true },
  });

  await db.userProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {
      completed: true,
      score: score._sum.points ?? 0,
      completedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      completed: true,
      score: score._sum.points ?? 0,
      completedAt: new Date(),
    },
  });

  // Al cerrar lección, no en cada respuesta (§6.3): es un resumen lento y
  // recalcularlo por turno costaría lo mismo sin cambiar el resultado.
  // Si falla, no se rompe la lección: el snapshot es contexto, no dato crítico.
  try {
    await refreshLearnerSnapshot(user.id);
  } catch {
    // Silencioso a propósito: completar la lección ya está persistido arriba.
  }
}
