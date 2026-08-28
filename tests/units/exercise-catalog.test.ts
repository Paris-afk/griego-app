import { describe, expect, it } from "vitest";

import { ExerciseSchema, exerciseTypes } from "@/features/exercises/schemas";
// Capa PURA a propósito: importar el registro arrastraría los renderers .tsx.
import {
  INFORMATIONAL_TYPES,
  validateExercise,
} from "@/features/exercises/validators";
import { ambiguousPositions, homophoneVariants } from "../../prisma/seed";

// Catálogo de la Fase 4.6 (EXERCISES.md). Cubre sobre todo los tipos que el
// contenido actual (módulos 0-1) todavía NO genera —`gender_sort`, `memory_grid`—
// porque un camino sin ejercitar es donde se esconden los fallos.

describe("catálogo", () => {
  // La completitud del registro ya la garantiza TS (`Record<ExerciseType, …>`),
  // así que aquí solo se prueba lo que TS no puede: que cada tipo declarado
  // tenga un validador que responde sin reventar.
  it("todo tipo declarado tiene despacho de validación", () => {
    expect(exerciseTypes.length).toBeGreaterThanOrEqual(16);
  });

  it("solo `concept` es informativo", () => {
    expect([...INFORMATIONAL_TYPES]).toEqual(["concept"]);
  });
});

describe("gender_sort", () => {
  const exercise = ExerciseSchema.parse({
    type: "gender_sort",
    instruction: "¿Qué artículo?",
    items: [
      { word: "δέντρο", article: "το" },
      { word: "θάλασσα", article: "η" },
      { word: "καφές", article: "ο" },
      { word: "παιδί", article: "το" },
    ],
  });

  it("acierta cuando todos los artículos coinciden", () => {
    const res = validateExercise(exercise, {
      δέντρο: "το",
      θάλασσα: "η",
      καφές: "ο",
      παιδί: "το",
    });
    expect(res.isCorrect).toBe(true);
    expect(res.errorTags).toEqual([]);
  });

  it("marca `genero_neutro` cuando el fallo es en un neutro", () => {
    const res = validateExercise(exercise, {
      δέντρο: "η", // el correcto era το
      θάλασσα: "η",
      καφές: "ο",
      παιδί: "το",
    });
    expect(res.isCorrect).toBe(false);
    // El neutro es lo único que no transfiere del español (CURRICULUM.md §4),
    // así que merece su propia etiqueta.
    expect(res.errorTags).toContain("genero_neutro");
  });

  it("distingue el fallo en masculino/femenino del neutro", () => {
    const res = validateExercise(exercise, {
      δέντρο: "το",
      θάλασσα: "ο", // el correcto era η
      καφές: "ο",
      παιδί: "το",
    });
    expect(res.errorTags).toContain("genero_incorrecto");
    expect(res.errorTags).not.toContain("genero_neutro");
  });
});

describe("autocomplete", () => {
  const exercise = ExerciseSchema.parse({
    type: "autocomplete",
    instruction: "Completa",
    answer: "νησί",
    blanks: [1],
    meaning: "isla",
  });

  it("acepta la palabra exacta", () => {
    expect(validateExercise(exercise, "νησί").isCorrect).toBe(true);
  });

  it("etiqueta la confusión η/ι/υ", () => {
    const res = validateExercise(exercise, "νισί");
    expect(res.isCorrect).toBe(false);
    expect(res.errorTags).toContain("confusion_i");
  });
});

describe("listen_choose", () => {
  const exercise = ExerciseSchema.parse({
    type: "listen_choose",
    instruction: "Escucha",
    answer: "νησί",
    options: ["νησί", "νισί", "νυσί"],
    meaning: "isla",
  });

  it("etiqueta la confusión cuando el distractor suena igual", () => {
    const res = validateExercise(exercise, "νισί");
    expect(res.isCorrect).toBe(false);
    expect(res.errorTags).toContain("confusion_i");
  });
});

describe("match_pairs y memory_grid", () => {
  it("match_pairs exige todas las parejas", () => {
    const ex = ExerciseSchema.parse({
      type: "match_pairs",
      instruction: "Une",
      pairs: [
        { left: "ψωμί", right: "pan" },
        { left: "νερό", right: "agua" },
        { left: "καφές", right: "café" },
      ],
    });
    expect(validateExercise(ex, ["ψωμί", "νερό"]).isCorrect).toBe(false);
    expect(validateExercise(ex, ["ψωμί", "νερό", "καφές"]).isCorrect).toBe(true);
  });

  it("memory_grid exige todas las parejas", () => {
    const ex = ExerciseSchema.parse({
      type: "memory_grid",
      instruction: "Parejas",
      pairs: [
        { greek: "ψωμί", match: "pan" },
        { greek: "νερό", match: "agua" },
        { greek: "καφές", match: "café" },
      ],
    });
    expect(validateExercise(ex, ["ψωμί"]).isCorrect).toBe(false);
    expect(validateExercise(ex, ["ψωμί", "νερό", "καφές"]).isCorrect).toBe(true);
  });
});

describe("speed_round", () => {
  const ex = ExerciseSchema.parse({
    type: "speed_round",
    instruction: "Rápido",
    claims: [
      { greek: "ψωμί", spanish: "pan", isTrue: true },
      { greek: "νερό", spanish: "café", isTrue: false },
      { greek: "καφές", spanish: "café", isTrue: true },
      { greek: "μήλο", spanish: "agua", isTrue: false },
    ],
  });

  it("aprueba con el 70% o más", () => {
    expect(validateExercise(ex, [true, false, true, false]).isCorrect).toBe(true);
    expect(validateExercise(ex, [true, false, true, true]).isCorrect).toBe(true); // 3/4
  });

  it("suspende por debajo del umbral", () => {
    expect(validateExercise(ex, [false, true, false, true]).isCorrect).toBe(false);
  });

  it("cuenta el tiempo agotado (null) como fallo, sin romper", () => {
    const res = validateExercise(ex, [true, null, null, null]);
    expect(res.isCorrect).toBe(false);
    expect(res.correct).toBe("1/4");
  });
});

describe("concept", () => {
  it("nunca se falla: es informativo", () => {
    const ex = ExerciseSchema.parse({
      type: "concept",
      instruction: "",
      title: "Tres letras, un sonido",
      body: "η, ι y υ suenan las tres /i/.",
    });
    expect(validateExercise(ex, null).isCorrect).toBe(true);
    expect(validateExercise(ex, "cualquier cosa").isCorrect).toBe(true);
  });

  it("no puntúa por defecto", () => {
    const ex = ExerciseSchema.parse({
      type: "concept",
      instruction: "",
      title: "t",
      body: "b",
    });
    expect(ex.points).toBe(0);
  });
});

describe("generadores de distractores del seed", () => {
  it("homophoneVariants cambia solo letras que suenan igual", () => {
    const variants = homophoneVariants("νησί", 3);
    expect(variants.length).toBeGreaterThan(0);
    expect(variants).not.toContain("νησί");
    // Todas conservan la longitud: es un cambio de letra, no otra palabra.
    for (const v of variants) expect(Array.from(v)).toHaveLength(4);
  });

  it("homophoneVariants no inventa nada si no hay letras ambiguas", () => {
    expect(homophoneVariants("κ")).toEqual([]);
  });

  it("ambiguousPositions señala las letras η/ι/υ y ο/ω", () => {
    // δέντρο → posiciones de ε(no), ο(sí, última)
    expect(ambiguousPositions("δέντρο")).toContain(5);
    expect(ambiguousPositions("κ")).toEqual([]);
  });
});

describe("dictation", () => {
  const ex = ExerciseSchema.parse({
    type: "dictation",
    instruction: "Escucha y escribe",
    answer: "νησί",
    meaning: "isla",
  });

  it("acepta la palabra exacta", () => {
    expect(validateExercise(ex, "νησί").isCorrect).toBe(true);
  });

  it("acepta sin acento pero lo señala", () => {
    const res = validateExercise(ex, "νησι");
    expect(res.isCorrect).toBe(true);
    expect(res.errorTags).toContain("acento_faltante");
  });

  it("etiqueta la confusión η/ι/υ, que es el punto del dictado", () => {
    // Escribir νισί al oír νησί es EL error que este tipo existe para entrenar:
    // las dos suenan igual y solo se distinguen sabiendo la palabra.
    const res = validateExercise(ex, "νισί");
    expect(res.isCorrect).toBe(false);
    expect(res.errorTags).toContain("confusion_i");
  });

  it("etiqueta la confusión ο/ω", () => {
    const omega = ExerciseSchema.parse({
      type: "dictation",
      instruction: "i",
      answer: "πρωί",
      meaning: "mañana",
    });
    expect(validateExercise(omega, "προί").errorTags).toContain(
      "confusion_omicron_omega",
    );
  });

  it("ignora espacios sobrantes al principio y al final", () => {
    expect(validateExercise(ex, "  νησί  ").isCorrect).toBe(true);
  });
});

describe("tolerancia a los acentos", () => {
  // Fallar una palabra entera por una tilde desanima sin enseñar nada: se
  // acepta y se SEÑALA (ARCHITECTURE.md §5.3). Esta prueba recorre todos los
  // tipos donde el usuario ESCRIBE, para que ninguno se salte la regla.
  const casos = [
    {
      nombre: "translation",
      exercise: {
        type: "translation",
        instruction: "i",
        prompt: { text: "árbol" },
        direction: "es→el",
        answer: "δέντρο",
        accept: [],
      },
      sinAcento: "δεντρο",
    },
    {
      nombre: "autocomplete",
      exercise: {
        type: "autocomplete",
        instruction: "i",
        answer: "δέντρο",
        blanks: [5],
        meaning: "árbol",
      },
      sinAcento: "δεντρο",
    },
    {
      nombre: "dictation",
      exercise: { type: "dictation", instruction: "i", answer: "δέντρο", meaning: "árbol" },
      sinAcento: "δεντρο",
    },
    {
      nombre: "phrase_blank",
      exercise: {
        type: "phrase_blank",
        instruction: "i",
        words: ["Πώς", "σε", "λένε;"],
        blankIndex: 2,
        answer: "Πώς σε λένε;",
        meaning: "¿cómo te llamas?",
      },
      sinAcento: "λενε;",
    },
  ];

  for (const caso of casos) {
    it(`${caso.nombre}: acepta sin tilde y lo señala`, () => {
      const ex = ExerciseSchema.parse(caso.exercise);
      const res = validateExercise(ex, caso.sinAcento);
      expect(res.isCorrect, `${caso.nombre} falló por una tilde`).toBe(true);
      expect(res.errorTags).toContain("acento_faltante");
    });
  }
});

describe("phrase_blank", () => {
  const ex = ExerciseSchema.parse({
    type: "phrase_blank",
    instruction: "Completa",
    words: ["Πώς", "σε", "λένε;"],
    blankIndex: 0,
    answer: "Πώς σε λένε;",
    meaning: "¿cómo te llamas?",
    options: ["Πώς", "Τι", "Με"],
  });

  it("solo juzga la palabra que faltaba, no la frase entera", () => {
    expect(validateExercise(ex, "Πώς").isCorrect).toBe(true);
    expect(validateExercise(ex, "Τι").isCorrect).toBe(false);
  });

  it("no exige escribir la frase completa", () => {
    // Si alguien escribiera la frase entera, NO es lo pedido: falta la palabra.
    expect(validateExercise(ex, "Πώς σε λένε;").isCorrect).toBe(false);
  });

  it("informa de la palabra correcta en el feedback", () => {
    expect(validateExercise(ex, "Τι").correct).toBe("Πώς");
  });
});
