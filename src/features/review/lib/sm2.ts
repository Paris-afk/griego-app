// Repetición espaciada SM-2 — función PURA, sin Prisma.
//
// SM-2 (Piotr Woźniak, 1987) es el algoritmo detrás de Anki y de casi todo lo
// que funciona en repaso espaciado. La idea: cada acierto alarga el intervalo
// hasta el siguiente repaso; un fallo lo reinicia. El `easeFactor` recuerda si
// una tarjeta te cuesta en general.
//
// Adaptación: el SM-2 original pide al usuario que se autoevalúe de 0 a 5
// ("¿qué tal lo recordaste?"). Aquí no se pregunta nada — la calidad se deriva
// del resultado real del ejercicio, que es un dato más honesto que una
// autoevaluación y no interrumpe el ritmo de la lección (Fase 4.5).

export interface Sm2State {
  /** Días hasta el próximo repaso. */
  interval: number;
  /** Facilidad acumulada de la tarjeta. Mínimo 1.3 por definición de SM-2. */
  easeFactor: number;
  /** Aciertos consecutivos. Un fallo lo pone a 0. */
  repetitions: number;
}

export const SM2_INITIAL: Sm2State = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
};

const MIN_EASE = 1.3;

export interface Sm2Outcome extends Sm2State {
  dueDate: Date;
}

/**
 * Siguiente estado tras responder.
 *
 * @param quality 0-5. Se deriva del ejercicio, no se le pregunta al usuario:
 *                acierto limpio = 5, acierto con observación (p. ej. sin
 *                acento) = 3, fallo = 1.
 */
export function nextSm2(
  state: Sm2State,
  quality: number,
  now: Date = new Date(),
): Sm2Outcome {
  const q = Math.min(5, Math.max(0, quality));
  const passed = q >= 3;

  let { interval, easeFactor, repetitions } = state;

  if (!passed) {
    // Fallo: vuelve a mañana y se reinicia la racha. El easeFactor NO se toca
    // aquí; lo ajusta la fórmula de abajo, que ya penaliza la calidad baja.
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }

  // Fórmula original de SM-2 para el ease.
  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  return {
    interval,
    easeFactor,
    repetitions,
    dueDate: new Date(now.getTime() + interval * 86_400_000),
  };
}

/**
 * Traduce el resultado de un ejercicio a la calidad 0-5 de SM-2.
 *
 * Acertar «con observación» (sin acento, σ por ς) no vale lo mismo que
 * acertar limpio: se acepta la respuesta, pero la tarjeta vuelve antes.
 */
export function qualityFromResult(
  isCorrect: boolean,
  errorTags: string[] = [],
): number {
  if (!isCorrect) return 1;
  return errorTags.length > 0 ? 3 : 5;
}
