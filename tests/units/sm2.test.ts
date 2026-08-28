import { describe, expect, it } from "vitest";

import { SM2_INITIAL, nextSm2, qualityFromResult } from "@/features/review/lib/sm2";

const NOW = new Date("2026-09-01T12:00:00Z");

describe("qualityFromResult", () => {
  it("acierto limpio vale el máximo", () => {
    expect(qualityFromResult(true, [])).toBe(5);
  });

  it("acierto CON observación vale menos", () => {
    // Escribir «δεντρο» por «δέντρο» se acepta (§5.3), pero no es lo mismo que
    // clavarlo: la tarjeta debe volver antes.
    expect(qualityFromResult(true, ["acento_faltante"])).toBe(3);
    expect(qualityFromResult(true, ["acento_faltante"])).toBeLessThan(
      qualityFromResult(true, []),
    );
  });

  it("fallo suspende", () => {
    expect(qualityFromResult(false, [])).toBeLessThan(3);
  });
});

describe("nextSm2", () => {
  it("el primer acierto programa para mañana", () => {
    const out = nextSm2(SM2_INITIAL, 5, NOW);
    expect(out.interval).toBe(1);
    expect(out.repetitions).toBe(1);
  });

  it("el segundo salta a 6 días", () => {
    const first = nextSm2(SM2_INITIAL, 5, NOW);
    expect(nextSm2(first, 5, NOW).interval).toBe(6);
  });

  it("a partir del tercero, el intervalo crece", () => {
    let state = nextSm2(SM2_INITIAL, 5, NOW);
    state = nextSm2(state, 5, NOW);
    const third = nextSm2(state, 5, NOW);
    expect(third.interval).toBeGreaterThan(6);
  });

  it("fallar reinicia: vuelve mañana", () => {
    let state = nextSm2(SM2_INITIAL, 5, NOW);
    state = nextSm2(state, 5, NOW);
    state = nextSm2(state, 5, NOW);
    expect(state.interval).toBeGreaterThan(6);

    const fallo = nextSm2(state, 1, NOW);
    expect(fallo.interval).toBe(1);
    expect(fallo.repetitions).toBe(0);
  });

  it("el easeFactor nunca baja de 1.3 (definición de SM-2)", () => {
    let state = SM2_INITIAL;
    for (let i = 0; i < 20; i++) state = nextSm2(state, 0, NOW);
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("acertar con dificultad hace que vuelva antes que acertar limpio", () => {
    let limpio = nextSm2(SM2_INITIAL, 5, NOW);
    limpio = nextSm2(limpio, 5, NOW);
    limpio = nextSm2(limpio, 5, NOW);

    let costoso = nextSm2(SM2_INITIAL, 3, NOW);
    costoso = nextSm2(costoso, 3, NOW);
    costoso = nextSm2(costoso, 3, NOW);

    expect(costoso.interval).toBeLessThan(limpio.interval);
  });

  it("`dueDate` es coherente con el intervalo", () => {
    const out = nextSm2(SM2_INITIAL, 5, NOW);
    const dias = (out.dueDate.getTime() - NOW.getTime()) / 86_400_000;
    expect(dias).toBeCloseTo(out.interval, 5);
  });

  it("aguanta calidades fuera de rango sin romperse", () => {
    expect(() => nextSm2(SM2_INITIAL, 99, NOW)).not.toThrow();
    expect(() => nextSm2(SM2_INITIAL, -5, NOW)).not.toThrow();
    expect(nextSm2(SM2_INITIAL, 99, NOW).interval).toBeGreaterThan(0);
  });
});
