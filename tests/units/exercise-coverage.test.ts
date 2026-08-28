import { describe, expect, it } from "vitest";

import {
  ExerciseSchema,
  exerciseTypes,
  type ExerciseType,
} from "@/features/exercises/schemas";
// Capa PURA a propósito: importar el registro arrastraría los renderers .tsx.
import { validateExercise } from "@/features/exercises/validators";

// Cobertura de los tipos que no cubre `exercise-catalog.test.ts`, más una
// guarda para que ningún tipo futuro se quede sin prueba.

describe("free_writing", () => {
  it("valida de forma determinista cuando hay respuesta canónica", () => {
    const ex = ExerciseSchema.parse({
      type: "free_writing",
      instruction: "Escribe en griego",
      prompt: { text: "árbol" },
      answer: "δέντρο",
      accept: ["δένδρο"],
    });
    expect(validateExercise(ex, "δέντρο").isCorrect).toBe(true);
    // `accept` cubre la variante culta, que también es correcta.
    expect(validateExercise(ex, "δένδρο").isCorrect).toBe(true);
    expect(validateExercise(ex, "θάλασσα").isCorrect).toBe(false);
  });

  it("acepta sin acento pero lo SEÑALA (regla de §5.3)", () => {
    const ex = ExerciseSchema.parse({
      type: "free_writing",
      instruction: "Escribe en griego",
      prompt: { text: "árbol" },
      answer: "δέντρο",
    });
    const res = validateExercise(ex, "δεντρο");
    expect(res.isCorrect).toBe(true);
    expect(res.errorTags).toContain("acento_faltante");
  });

  it("sin respuesta canónica NO decide por su cuenta: eso es de la Fase 5", () => {
    const ex = ExerciseSchema.parse({
      type: "free_writing",
      instruction: "Describe tu familia",
      prompt: { text: "Escribe dos frases" },
    });
    // Devuelve `false` sin etiquetas y sin respuesta correcta: la corrección de
    // una respuesta abierta la da DeepSeek, no este validador (regla 1).
    const res = validateExercise(ex, "Η οικογένειά μου");
    expect(res.isCorrect).toBe(false);
    expect(res.correct).toBeUndefined();
  });
});

describe("case_pairs", () => {
  const ex = ExerciseSchema.parse({
    type: "case_pairs",
    instruction: "Une mayúscula y minúscula",
    pairs: [
      { upper: "Γ", lower: "γ" },
      { upper: "Δ", lower: "δ" },
      { upper: "Λ", lower: "λ" },
    ],
  });

  it("solo acierta con todas las parejas cerradas", () => {
    expect(validateExercise(ex, []).isCorrect).toBe(false);
    expect(validateExercise(ex, ["Γ", "Δ"]).isCorrect).toBe(false);
    expect(validateExercise(ex, ["Γ", "Δ", "Λ"]).isCorrect).toBe(true);
  });

  it("no se deja engañar por entradas basura", () => {
    expect(validateExercise(ex, "Γ").isCorrect).toBe(false);
    expect(validateExercise(ex, null).isCorrect).toBe(false);
    expect(validateExercise(ex, [1, 2, 3]).isCorrect).toBe(false);
  });

  it("muestra las parejas correctas en el feedback", () => {
    expect(validateExercise(ex, []).correct).toBe("Γγ · Δδ · Λλ");
  });
});

describe("reading_comprehension", () => {
  it("es un placeholder de la Fase 7 y no aprueba nada todavía", () => {
    const ex = ExerciseSchema.parse({
      type: "reading_comprehension",
      instruction: "Lee y responde",
      prompt: { text: "Η Ελλάδα είναι μια χώρα." },
      questions: [
        { question: "¿Qué es Grecia?", options: ["una ciudad", "un país"], answer: "un país" },
      ],
    });
    // Documenta el estado real: sin implementar. Si alguien lo implementa, este
    // test falla y le obliga a venir aquí a describir el comportamiento nuevo.
    expect(validateExercise(ex, "un país").isCorrect).toBe(false);
  });
});

describe("robustez de todos los validadores", () => {
  // Un ejemplo mínimo válido por tipo. Si se añade un tipo y no se añade aquí,
  // el test de abajo falla: es la guarda que impide tipos sin prueba.
  const samples: Record<ExerciseType, unknown> = {
    multiple_choice: {
      type: "multiple_choice",
      instruction: "i",
      prompt: { text: "δέντρο" },
      options: [{ text: "árbol" }, { text: "mar" }],
      answer: "árbol",
    },
    fill_blank: { type: "fill_blank", instruction: "i", prompt: { text: "p" }, answer: "το" },
    order_words: {
      type: "order_words",
      instruction: "i",
      prompt: { text: "p" },
      orderType: "word",
      words: ["α", "β"],
      answer: ["α", "β"],
    },
    translation: {
      type: "translation",
      instruction: "i",
      prompt: { text: "árbol" },
      direction: "es→el",
      answer: "δέντρο",
    },
    free_writing: { type: "free_writing", instruction: "i", prompt: { text: "p" } },
    reading_comprehension: {
      type: "reading_comprehension",
      instruction: "i",
      prompt: { text: "p" },
      questions: [{ question: "q", options: ["a", "b"], answer: "a" }],
    },
    alphabet_drill: {
      type: "alphabet_drill",
      instruction: "i",
      prompt: { text: "p" },
      letter: "α",
      answer: "α",
      accept: ["α"],
    },
    repeat_word: { type: "repeat_word", instruction: "i", prompt: { text: "δέντρο" }, target: "δέντρο" },
    concept: { type: "concept", instruction: "", title: "t", body: "b" },
    match_pairs: {
      type: "match_pairs",
      instruction: "i",
      pairs: [
        { left: "α", right: "a" },
        { left: "β", right: "b" },
        { left: "γ", right: "c" },
      ],
    },
    gender_sort: {
      type: "gender_sort",
      instruction: "i",
      items: [
        { word: "δέντρο", article: "το" },
        { word: "θάλασσα", article: "η" },
        { word: "καφές", article: "ο" },
        { word: "παιδί", article: "το" },
      ],
    },
    listen_choose: {
      type: "listen_choose",
      instruction: "i",
      answer: "νησί",
      options: ["νησί", "νισί"],
    },
    autocomplete: { type: "autocomplete", instruction: "i", answer: "νησί", blanks: [1], meaning: "isla" },
    case_pairs: {
      type: "case_pairs",
      instruction: "i",
      pairs: [
        { upper: "Γ", lower: "γ" },
        { upper: "Δ", lower: "δ" },
        { upper: "Λ", lower: "λ" },
      ],
    },
    memory_grid: {
      type: "memory_grid",
      instruction: "i",
      pairs: [
        { greek: "α", match: "a" },
        { greek: "β", match: "b" },
        { greek: "γ", match: "c" },
      ],
    },
    speed_round: {
      type: "speed_round",
      instruction: "i",
      claims: [
        { greek: "α", spanish: "a", isTrue: true },
        { greek: "β", spanish: "c", isTrue: false },
        { greek: "γ", spanish: "c", isTrue: true },
        { greek: "δ", spanish: "a", isTrue: false },
      ],
    },
  };

  it("hay un ejemplo por cada tipo declarado", () => {
    // Guarda anti-olvido: añadir un tipo obliga a añadir su ejemplo aquí.
    expect(Object.keys(samples).sort()).toEqual([...exerciseTypes].sort());
  });

  it("todo ejemplo es válido contra el contrato Zod", () => {
    for (const type of exerciseTypes) {
      const parsed = ExerciseSchema.safeParse(samples[type]);
      expect(parsed.success, `${type}: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    }
  });

  it("ningún validador revienta con entradas basura", () => {
    // La validación corre en el servidor con lo que mande el cliente: nunca
    // debe lanzar, pase lo que pase (ARCHITECTURE.md §8).
    const garbage = [null, undefined, "", 0, -1, [], {}, "texto", [null], { a: 1 }, true];
    for (const type of exerciseTypes) {
      const exercise = ExerciseSchema.parse(samples[type]);
      for (const input of garbage) {
        expect(
          () => validateExercise(exercise, input),
          `${type} reventó con ${JSON.stringify(input)}`,
        ).not.toThrow();
        const res = validateExercise(exercise, input);
        expect(typeof res.isCorrect, `${type} no devolvió isCorrect booleano`).toBe("boolean");
        expect(Array.isArray(res.errorTags), `${type} no devolvió errorTags array`).toBe(true);
      }
    }
  });

  it("solo `concept` aprueba con una entrada vacía", () => {
    // Un tipo puntuable que apruebe sin respuesta sería un fallo grave: dejaría
    // avanzar la lección sin haber hecho nada.
    const passingEmpty = exerciseTypes.filter((type) => {
      const exercise = ExerciseSchema.parse(samples[type]);
      return validateExercise(exercise, null).isCorrect;
    });
    expect(passingEmpty).toEqual(["concept"]);
  });
});
