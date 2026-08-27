import { db } from "@/shared/lib/db";
import { getCurrentUser } from "@/features/auth";

// Lecturas del reproductor. Para poder reanudar, devuelve por cada ejercicio si
// el usuario ya lo respondió correctamente y cuántos puntos lleva acumulados.
export async function getLessonPlayback(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      module: {
        select: {
          id: true,
          title: true,
          level: { select: { id: true, name: true, course: { select: { title: true } } } },
        },
      },
      exercises: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, schemaJson: true, order: true },
      },
    },
  });
  if (!lesson) return null;

  const correctAnswers = await db.userAnswer.findMany({
    where: { userId: user.id, isCorrect: true, exercise: { lessonId } },
    select: { exerciseId: true },
  });
  const correctIds = new Set(correctAnswers.map((a) => a.exerciseId));

  const score = await db.userAnswer.aggregate({
    where: { userId: user.id, exercise: { lessonId } },
    _sum: { points: true },
  });

  const completed = lesson.exercises.every((e) => correctIds.has(e.id));

  return {
    lesson,
    initialScore: score._sum.points ?? 0,
    completed,
    correctIds,
  };
}
