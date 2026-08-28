import { describe, expect, it } from "vitest";

import {
  MASTERY_MAX,
  MASTERY_MIN,
  WEAK_THRESHOLD,
  byWeakestFirst,
  computeMastery,
  difficultyForMastery,
  isWeak,
} from "@/shared/lib/mastery";

const NOW = new Date("2026-09-01T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

describe("computeMastery", () => {
  it("sin historial, dominio mínimo", () => {
    expect(computeMastery([], NOW)).toBe(MASTERY_MIN);
  });

  it("sube con los aciertos", () => {
    const uno = computeMastery([{ isCorrect: true, answeredAt: daysAgo(0) }], NOW);
    const tres = computeMastery(
      Array.from({ length: 3 }, () => ({ isCorrect: true, answeredAt: daysAgo(0) })),
      NOW,
    );
    expect(tres).toBeGreaterThan(uno);
  });

  it("nunca se sale de 0-5", () => {
    const muchos = Array.from({ length: 50 }, () => ({
      isCorrect: true,
      answeredAt: daysAgo(0),
    }));
    expect(computeMastery(muchos, NOW)).toBe(MASTERY_MAX);

    const fallos = Array.from({ length: 50 }, () => ({
      isCorrect: false,
      answeredAt: daysAgo(0),
    }));
    expect(computeMastery(fallos, NOW)).toBe(MASTERY_MIN);
  });

  it("un fallo pesa más que un acierto", () => {
    // Acertar cuatro veces y fallar una no es dominar: es reconocer a veces.
    // Con pesos iguales, un 60% de aciertos daría dominio alto, y no lo es.
    const respuestas = [
      { isCorrect: true, answeredAt: daysAgo(0) },
      { isCorrect: true, answeredAt: daysAgo(0) },
      { isCorrect: false, answeredAt: daysAgo(0) },
    ];
    // 2 aciertos (+2) y 1 fallo (−2) → 0, no 1.
    expect(computeMastery(respuestas, NOW)).toBe(0);
  });

  it("lo viejo pesa menos que lo reciente", () => {
    const reciente = computeMastery(
      [
        { isCorrect: true, answeredAt: daysAgo(0) },
        { isCorrect: true, answeredAt: daysAgo(0) },
        { isCorrect: true, answeredAt: daysAgo(0) },
      ],
      NOW,
    );
    const viejo = computeMastery(
      [
        { isCorrect: true, answeredAt: daysAgo(25) },
        { isCorrect: true, answeredAt: daysAgo(25) },
        { isCorrect: true, answeredAt: daysAgo(25) },
      ],
      NOW,
    );
    // Saber una palabra hace un mes no es saberla hoy: es lo que mide la
    // repetición espaciada.
    expect(viejo).toBeLessThan(reciente);
  });

  it("lo anterior a la ventana no cuenta", () => {
    expect(
      computeMastery([{ isCorrect: true, answeredAt: daysAgo(60) }], NOW),
    ).toBe(MASTERY_MIN);
  });
});

describe("difficultyForMastery", () => {
  it("fallar hace que vuelva MÁS FÁCIL — el andamiaje es el punto", () => {
    expect(difficultyForMastery(0)).toBe("easy");
    expect(difficultyForMastery(1)).toBe("easy");
  });

  it("acertar sube el listón", () => {
    expect(difficultyForMastery(2)).toBe("medium");
    expect(difficultyForMastery(3)).toBe("medium");
    expect(difficultyForMastery(4)).toBe("hard");
    expect(difficultyForMastery(5)).toBe("hard");
  });

  it("es monótona: más dominio nunca da menos dificultad", () => {
    const orden = { easy: 0, medium: 1, hard: 2 };
    for (let m = MASTERY_MIN; m < MASTERY_MAX; m++) {
      expect(orden[difficultyForMastery(m + 1)]).toBeGreaterThanOrEqual(
        orden[difficultyForMastery(m)],
      );
    }
  });
});

describe("orden y umbral de repaso", () => {
  it("los más flojos van primero", () => {
    const items = [
      { id: "a", mastery: 5 },
      { id: "b", mastery: 0 },
      { id: "c", mastery: 3 },
    ];
    expect(byWeakestFirst(items).map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("no muta el original", () => {
    const items = [{ mastery: 3 }, { mastery: 1 }];
    byWeakestFirst(items);
    expect(items[0].mastery).toBe(3);
  });

  it("`isWeak` marca lo que hay que repasar de verdad", () => {
    expect(isWeak(0)).toBe(true);
    expect(isWeak(WEAK_THRESHOLD)).toBe(true);
    expect(isWeak(WEAK_THRESHOLD + 1)).toBe(false);
    expect(isWeak(MASTERY_MAX)).toBe(false);
  });
});
