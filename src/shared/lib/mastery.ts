// Puntaje de dominio por entrada de vocabulario — TS puro, sin dependencias.
//
// Es la columna vertebral de la Fase 6 (EXERCISES.md §5): un solo número
// gobierna QUÉ te toca (la cola de repaso) y QUÉ TAN DIFÍCIL te lo pregunta
// (la escalera). Vive en `shared/` porque lo comparten exercises, review y
// progress — regla 4 de ARCHITECTURE.md §3.1.

export const MASTERY_MIN = 0;
export const MASTERY_MAX = 5;

/** Cuánto sube un acierto y cuánto baja un fallo. */
const GAIN = 1;
// Un fallo pesa MÁS que un acierto a propósito: si aciertas cuatro veces y
// fallas una, no dominas la palabra — la reconoces a veces. Con pesos iguales,
// el dominio subiría con un 60% de aciertos, que no es dominar nada.
const LOSS = 2;

/** Días tras los que una respuesta deja de contar como reciente. */
const RECENCY_DAYS = 30;

export interface MasteryAnswer {
  isCorrect: boolean;
  answeredAt: Date;
}

/**
 * Dominio 0-5 a partir del historial de respuestas de UNA entrada.
 *
 * No es una media: las respuestas viejas pesan menos, porque saber una palabra
 * hace un mes no es saberla hoy — que es justo lo que la repetición espaciada
 * intenta medir.
 */
export function computeMastery(
  answers: MasteryAnswer[],
  now: Date = new Date(),
): number {
  if (answers.length === 0) return MASTERY_MIN;

  let score = 0;
  for (const answer of answers) {
    const ageDays = (now.getTime() - answer.answeredAt.getTime()) / 86_400_000;
    // Peso lineal 1 → 0 a lo largo de la ventana; nunca negativo.
    const weight = Math.max(0, 1 - ageDays / RECENCY_DAYS);
    score += (answer.isCorrect ? GAIN : -LOSS) * weight;
  }

  return clamp(Math.round(score));
}

function clamp(value: number): number {
  return Math.min(MASTERY_MAX, Math.max(MASTERY_MIN, value));
}

// ── La escalera de dificultad (EXERCISES.md §5) ─────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

/**
 * Qué tan difícil preguntar algo, según lo bien que se sepa.
 *
 * La regla que da sentido a todo: **fallas → vuelve más fácil**. Repasar una
 * palabra que te venció con el MISMO ejercicio que te venció no enseña, solo
 * frustra. El andamiaje es el punto.
 */
export function difficultyForMastery(mastery: number): Difficulty {
  if (mastery <= 1) return "easy";
  if (mastery <= 3) return "medium";
  return "hard";
}

/** Ordena de más flojo a más dominado: es el orden de la cola de repaso. */
export function byWeakestFirst<T extends { mastery: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.mastery - b.mastery);
}

/** Se considera "flojo" lo que hay que repasar de verdad. */
export const WEAK_THRESHOLD = 2;

export function isWeak(mastery: number): boolean {
  return mastery <= WEAK_THRESHOLD;
}
