import "server-only";

import { computeMastery, isWeak, MASTERY_MAX } from "@/shared/lib/mastery";
import { db } from "@/shared/lib/db";

// Estadísticas del alumno (Fase 6). Todo se deriva de `UserAnswer` y
// `UserProgress`: no hay contadores que puedan quedar desincronizados.

export interface ProgressStats {
  streak: number;
  points: number;
  dailyGoalMinutes: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  /** Palabras con dominio alto (4-5 de 5). */
  mastered: number;
  /** Palabras vistas alguna vez. */
  seen: number;
  /** Palabras flojas que conviene repasar. */
  weak: number;
  accuracy: number | null;
  answers: number;
}

const WINDOW_DAYS = 30;

export async function getProgressStats(userId: string): Promise<ProgressStats> {
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000);

  const [profile, completed, total, answers] = await Promise.all([
    db.profile.findUnique({ where: { userId } }),
    db.userProgress.count({ where: { userId, completed: true } }),
    db.lesson.count(),
    db.userAnswer.findMany({
      where: { userId, answeredAt: { gte: since } },
      select: {
        isCorrect: true,
        answeredAt: true,
        points: true,
        exercise: { select: { schemaJson: true } },
      },
    }),
  ]);

  // Dominio por palabra, con el mismo cálculo que usa el repaso: derivarlo en
  // los dos sitios evita que la pantalla de stats y la de repaso se
  // contradigan.
  const byTerm = new Map<string, { isCorrect: boolean; answeredAt: Date }[]>();
  for (const answer of answers) {
    const term = greekTermOf(answer.exercise.schemaJson);
    if (!term) continue;
    const list = byTerm.get(term) ?? [];
    list.push({ isCorrect: answer.isCorrect, answeredAt: answer.answeredAt });
    byTerm.set(term, list);
  }

  let mastered = 0;
  let weak = 0;
  for (const history of byTerm.values()) {
    const mastery = computeMastery(history);
    if (mastery >= MASTERY_MAX - 1) mastered++;
    else if (isWeak(mastery)) weak++;
  }

  const correct = answers.filter((a) => a.isCorrect).length;

  return {
    streak: profile?.streak ?? 0,
    points: answers.reduce((sum, a) => sum + a.points, 0),
    dailyGoalMinutes: profile?.dailyGoalMinutes ?? 15,
    lessonsCompleted: completed,
    lessonsTotal: total,
    mastered,
    seen: byTerm.size,
    weak,
    accuracy: answers.length > 0 ? Math.round((correct / answers.length) * 100) : null,
    answers: answers.length,
  };
}

function greekTermOf(schemaJson: unknown): string | null {
  if (typeof schemaJson !== "object" || schemaJson === null) return null;
  const schema = schemaJson as Record<string, unknown>;
  if (typeof schema.answer === "string" && /\p{Script=Greek}/u.test(schema.answer)) {
    return schema.answer;
  }
  const prompt = schema.prompt as { text?: unknown } | undefined;
  if (typeof prompt?.text === "string" && /\p{Script=Greek}/u.test(prompt.text)) {
    return prompt.text;
  }
  if (typeof schema.letter === "string") return schema.letter;
  return null;
}
