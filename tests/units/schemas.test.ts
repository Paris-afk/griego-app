import { describe, expect, it } from "vitest";

import { ExerciseSchema, exerciseTypes } from "@/features/exercises/schemas";

const validCases: Record<string, unknown>[] = [
  {
    type: "multiple_choice",
    instruction: "¿…?",
    points: 10,
    prompt: { text: "a" },
    options: [{ text: "x" }, { text: "y" }],
    answer: "x",
  },
  { type: "translation", instruction: "escribe", prompt: { text: "a" }, answer: "β", accept: [] },
  { type: "fill_blank", instruction: "completa", prompt: { text: "a" }, answer: "x", accept: [] },
  { type: "order_words", instruction: "ordena", prompt: { text: "a" }, words: ["a", "b"], answer: ["a", "b"] },
  { type: "alphabet_drill", instruction: "letra", letter: "α", prompt: { text: "alfa" }, answer: "α", accept: [] },
];

describe("ExerciseSchema", () => {
  it("acepta los tipos válidos con defaults", () => {
    for (const c of validCases) {
      const r = ExerciseSchema.safeParse(c);
      expect(r.success, JSON.stringify(c)).toBe(true);
      if (r.success) {
        expect(r.data.type).toBe(c.type);
      }
    }
  });

  it("rellena points y difficulty con defaults", () => {
    const r = ExerciseSchema.parse({
      type: "multiple_choice",
      instruction: "¿?",
      prompt: { text: "a" },
      options: [{ text: "x" }, { text: "y" }],
      answer: "x",
    });
    expect(r.points).toBe(10);
    expect(r.difficulty).toBe("easy");
  });

  it("rechaza un tipo desconocido", () => {
    expect(ExerciseSchema.safeParse({ type: "otro", instruction: "x" }).success).toBe(false);
  });

  it("lista exhaustiva de exerciseTypes", () => {
    expect(exerciseTypes).toContain("multiple_choice");
    expect(exerciseTypes).toContain("repeat_word");
  });
});
