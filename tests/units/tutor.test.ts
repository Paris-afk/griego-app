import { beforeEach, describe, expect, it } from "vitest";

import { askTutor } from "@/features/tutor/lib/tutor-client";
import { TutorResponseSchema } from "@/features/tutor/schemas";
import {
  SYSTEM_PROMPT,
  buildMessages,
  renderLearnerContext,
  renderTurn,
} from "@/features/tutor/lib/prompt";
import { buildProgressNote } from "@/features/tutor/lib/progress-note";
import { buildSnapshot } from "@/features/tutor/lib/snapshot";
import { ERROR_TAGS, isKnownErrorTag } from "@/shared/lib/error-tags";
import {
  RATE_LIMIT_CONFIG,
  checkRateLimit,
  resetRateLimit,
} from "@/features/tutor/lib/rate-limit";

describe("contrato de la respuesta del tutor", () => {
  it("acepta una respuesta bien formada", () => {
    const res = TutorResponseSchema.safeParse({
      errors: [{ user: "δεντρο", correct: "δέντρο", why: "falta el acento" }],
      explanation: "Te faltó el acento agudo en la έ.",
      encouragement: "Vas bien.",
      tip: "El acento no es opcional en griego.",
    });
    expect(res.success).toBe(true);
  });

  it("rellena los opcionales para que el frontend nunca reciba undefined", () => {
    const res = TutorResponseSchema.parse({ explanation: "Una explicación." });
    expect(res.errors).toEqual([]);
    expect(res.encouragement).toBe("");
    expect(res.tip).toBe("");
  });

  it("rechaza una respuesta sin explicación: es el cuerpo del feedback", () => {
    expect(TutorResponseSchema.safeParse({ explanation: "" }).success).toBe(false);
    expect(TutorResponseSchema.safeParse({}).success).toBe(false);
  });

  it("rechaza JSON válido con la forma equivocada (lo que json_object NO evita)", () => {
    // DeepSeek con response_format garantiza JSON parseable, no estos campos.
    expect(TutorResponseSchema.safeParse({ mensaje: "hola" }).success).toBe(false);
    expect(TutorResponseSchema.safeParse("una cadena").success).toBe(false);
  });
});

describe("prompt", () => {
  const ctx = {
    level: "A1",
    moduleTitle: "Saludos",
    masteredCount: 84,
    streak: 6,
    recurringErrors: [
      { tag: "acento_faltante", count: 14 },
      { tag: "confusion_i", count: 9 },
    ],
    weakLetters: ["ξ", "ψ"],
  };

  it("el system prompt cumple lo que exige la doc de DeepSeek", () => {
    // Sin la palabra "json" y un ejemplo del formato, con response_format el
    // modelo puede devolver solo espacios en blanco.
    expect(SYSTEM_PROMPT.toLowerCase()).toContain("json");
    expect(SYSTEM_PROMPT).toContain('"explanation"');
  });

  it("el system prompt le prohíbe inventar hechos contables", () => {
    // Es la regla que impide que la caché convierta al profesor en mentiroso.
    expect(SYSTEM_PROMPT).toMatch(/NUNCA afirmes datos/);
  });

  it("el contexto del alumno es compacto", () => {
    const rendered = renderLearnerContext(ctx);
    expect(rendered).toContain("A1");
    expect(rendered).toContain("acento_faltante (14)");
    // Debe seguir siendo un resumen, no un volcado del historial (§6.3).
    expect(rendered.split("\n").length).toBeLessThanOrEqual(5);
  });

  it("el turno incluye los errorTags que ya detectó el corrector", () => {
    const rendered = renderTurn({
      instruction: "Escribe en griego",
      expected: "δέντρο",
      userAnswer: "δεντρο",
      errorTags: ["acento_faltante"],
      bridges: [],
    });
    expect(rendered).toContain("acento_faltante");
    expect(rendered).toContain("δεντρο");
  });

  it("inyecta el puente contrastivo cuando existe", () => {
    const rendered = renderTurn({
      instruction: "i",
      expected: "e",
      userAnswer: "u",
      errorTags: ["aspecto_incorrecto"],
      bridges: ["El español ya distingue pretérito/imperfecto."],
    });
    expect(rendered).toContain("ya sabe del español");
    expect(rendered).toContain("pretérito/imperfecto");
  });

  it("buildMessages produce system + user", () => {
    const messages = buildMessages(ctx, {
      instruction: "i",
      expected: "e",
      userAnswer: "u",
      errorTags: [],
      bridges: [],
    });
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
  });
});

describe("hechos contables (los genera el código, no la IA)", () => {
  it("no dice nada la primera vez: señalarlo sonaría a reproche", () => {
    expect(buildProgressNote(["acento_faltante"], { acento_faltante: 1 }).text).toBeNull();
  });

  it("avisa a partir de la segunda vez, con el ordinal correcto", () => {
    const note = buildProgressNote(["acento_faltante"], { acento_faltante: 3 });
    expect(note.text).toBe(
      "Es la 3ª vez esta semana que omites el acento. Lo agregué a tu repaso.",
    );
    expect(note.tag).toBe("acento_faltante");
  });

  it("elige el error más repetido cuando hay varios", () => {
    const note = buildProgressNote(["confusion_i", "acento_faltante"], {
      confusion_i: 2,
      acento_faltante: 9,
    });
    expect(note.tag).toBe("acento_faltante");
  });

  it("calla ante un tag desconocido en vez de inventar una frase", () => {
    expect(buildProgressNote(["tag_inventado"], { tag_inventado: 5 }).text).toBeNull();
  });

  it("calla cuando no hubo errores", () => {
    expect(buildProgressNote([], {}).text).toBeNull();
  });

  it("el conteo es fresco: el mismo tag con otro conteo da otra frase", () => {
    // Esta es la razón de existir del módulo. Si esto viniera de la IA y se
    // cacheara, la frase quedaría congelada y acabaría siendo falsa.
    const a = buildProgressNote(["confusion_i"], { confusion_i: 2 }).text;
    const b = buildProgressNote(["confusion_i"], { confusion_i: 7 }).text;
    expect(a).not.toBe(b);
    expect(b).toContain("7ª");
  });
});

describe("rate limiting", () => {
  beforeEach(() => resetRateLimit());

  it("deja pasar hasta el límite", () => {
    for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_CALLS_PER_WINDOW; i++) {
      expect(checkRateLimit("u1").allowed, `llamada ${i + 1}`).toBe(true);
    }
    expect(checkRateLimit("u1").allowed).toBe(false);
  });

  it("informa de cuánto falta para reintentar", () => {
    const now = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_CALLS_PER_WINDOW; i++) {
      checkRateLimit("u2", now);
    }
    const blocked = checkRateLimit("u2", now + 10_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("libera al salir de la ventana", () => {
    const now = 2_000_000;
    for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_CALLS_PER_WINDOW; i++) {
      checkRateLimit("u3", now);
    }
    expect(checkRateLimit("u3", now).allowed).toBe(false);
    expect(checkRateLimit("u3", now + RATE_LIMIT_CONFIG.WINDOW_MS + 1).allowed).toBe(true);
  });

  it("las claves no se pisan entre sí", () => {
    for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_CALLS_PER_WINDOW; i++) {
      checkRateLimit("a");
    }
    expect(checkRateLimit("a").allowed).toBe(false);
    expect(checkRateLimit("b").allowed).toBe(true);
  });
});

describe("degradación sin IA", () => {
  const turn = {
    instruction: "Escribe en griego",
    expected: "δέντρο",
    userAnswer: "δεντρο",
    errorTags: ["acento_faltante"],
    bridges: [],
  };
  const ctx = {
    level: "A1",
    masteredCount: 0,
    streak: 0,
    recurringErrors: [],
    weakLetters: [],
  };

  it("sin DEEPSEEK_API_KEY devuelve `unavailable` en vez de lanzar", async () => {
    // Garantía de la Fase 5: la app funciona ENTERA sin IA. Si esto lanzara,
    // fallar un ejercicio rompería la lección.
    const original = process.env.DEEPSEEK_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    try {
      const outcome = await askTutor(ctx, turn);
      expect(outcome.status).toBe("unavailable");
      expect(outcome).toMatchObject({ reason: "no_api_key" });
    } finally {
      if (original !== undefined) process.env.DEEPSEEK_API_KEY = original;
    }
  });
});

describe("catálogo de errorTags", () => {
  it("ninguna etiqueta es subcadena de otra", () => {
    // INVARIANTE CRÍTICO: `UserAnswer.errorTags` es un CSV y los conteos usan
    // `contains`. Si una etiqueta fuera prefijo de otra, los conteos se
    // contaminarían en silencio y la nota de progreso mentiría.
    const colisiones: string[] = [];
    for (const a of ERROR_TAGS) {
      for (const b of ERROR_TAGS) {
        if (a !== b && b.includes(a)) colisiones.push(`"${a}" está dentro de "${b}"`);
      }
    }
    expect(colisiones).toEqual([]);
  });

  it("reconoce las etiquetas conocidas y rechaza las inventadas", () => {
    expect(isKnownErrorTag("acento_faltante")).toBe(true);
    expect(isKnownErrorTag("inventado")).toBe(false);
  });
});

describe("LearnerSnapshot", () => {
  it("solo considera recurrente lo que se repite", () => {
    const snap = buildSnapshot({
      errorTags: ["acento_faltante", "acento_faltante", "confusion_i"],
      masteredCount: 10,
    });
    expect(snap.recurringErrors).toEqual([{ tag: "acento_faltante", count: 2 }]);
  });

  it("ordena por frecuencia", () => {
    const snap = buildSnapshot({
      errorTags: [
        ...Array(5).fill("confusion_i"),
        ...Array(9).fill("acento_faltante"),
      ],
      masteredCount: 0,
    });
    expect(snap.recurringErrors[0].tag).toBe("acento_faltante");
  });

  it("deriva las letras débiles de los errores recurrentes", () => {
    const snap = buildSnapshot({
      errorTags: ["confusion_i", "confusion_i", "confusion_omicron_omega", "confusion_omicron_omega"],
      masteredCount: 0,
    });
    // Una letra es débil porque PROVOCA fallos, no por aparecer mucho.
    expect(snap.weakLetters).toEqual(expect.arrayContaining(["η", "ι", "υ", "ο", "ω"]));
  });

  it("ignora etiquetas desconocidas en vez de contarlas", () => {
    const snap = buildSnapshot({
      errorTags: ["inventado", "inventado", "inventado"],
      masteredCount: 0,
    });
    expect(snap.recurringErrors).toEqual([]);
  });

  it("el resumen es compacto: es su razón de existir (§6.3)", () => {
    const snap = buildSnapshot({
      errorTags: Array(20).fill("acento_faltante"),
      masteredCount: 84,
    });
    expect(snap.summaryText).toContain("84 palabras dominadas");
    // Mandar el historial crudo sería caro y ruidoso; esto debe caber en ~80 tokens.
    expect(snap.summaryText.length).toBeLessThan(300);
  });

  it("aguanta un alumno sin historial", () => {
    const snap = buildSnapshot({ errorTags: [], masteredCount: 0 });
    expect(snap.recurringErrors).toEqual([]);
    expect(snap.weakLetters).toEqual([]);
    expect(snap.summaryText).toBeTruthy();
  });
});
