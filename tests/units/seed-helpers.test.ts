import { describe, expect, it } from "vitest";

import {
  chunkSizes,
  interleaveLessonExercises,
  type LessonExercise,
} from "../../prisma/seed-helpers";
import { mergeTinyCategories } from "../../prisma/seed";

describe("chunkSizes (partición de lecciones)", () => {
  it("una sola lección si no supera el máximo", () => {
    expect(chunkSizes(6)).toEqual([6]);
  });

  it("parte el alfabeto en 3 lecciones de 8", () => {
    expect(chunkSizes(24, 8, 10)).toEqual([8, 8, 8]);
  });

  it("parte 10 en dos lecciones de 5 (→ 10 ejercicios c/u)", () => {
    expect(chunkSizes(10)).toEqual([5, 5]);
  });

  it("parte 13 sin dejar una última minúscula", () => {
    const sizes = chunkSizes(13);
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(13);
    expect(sizes.every((s) => s >= 4)).toBe(true);
  });

  it("nunca deja lección menor a `min`", () => {
    for (let n = 1; n <= 20; n++) {
      for (const s of chunkSizes(n)) expect(s).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("interleaveLessonExercises", () => {
  const mk = (word: string, type: LessonExercise["type"]): LessonExercise => ({
    word,
    type,
    schemaJson: { type: "placeholder" } as never,
  });

  it("no deja la misma palabra en dos ejercicios seguidos", () => {
    const items = [
      mk("α", "MULTIPLE_CHOICE"),
      mk("α", "TRANSLATION"),
      mk("β", "MULTIPLE_CHOICE"),
      mk("β", "TRANSLATION"),
      mk("γ", "MULTIPLE_CHOICE"),
      mk("γ", "TRANSLATION"),
    ];
    const out = interleaveLessonExercises(items, "señal");
    for (let i = 1; i < out.length; i++) {
      expect(out[i].word).not.toBe(out[i - 1].word);
    }
  });

  it("no deja el mismo tipo más de 2 veces seguidas", () => {
    const items = [
      mk("α", "MULTIPLE_CHOICE"),
      mk("α", "TRANSLATION"),
      mk("β", "MULTIPLE_CHOICE"),
      mk("β", "TRANSLATION"),
      mk("γ", "MULTIPLE_CHOICE"),
      mk("γ", "TRANSLATION"),
      mk("δ", "ORDER_WORDS"),
      mk("ε", "FILL_BLANK"),
    ];
    const out = interleaveLessonExercises(items, "s");
    for (let i = 2; i < out.length; i++) {
      const threeSame =
        out[i].type === out[i - 1].type && out[i].type === out[i - 2].type;
      expect(threeSame).toBe(false);
    }
  });

  it("conserva todos los elementos", () => {
    const items = [
      mk("α", "MULTIPLE_CHOICE"),
      mk("α", "TRANSLATION"),
      mk("β", "ORDER_WORDS"),
    ];
    const out = interleaveLessonExercises(items, "x");
    expect(out).toHaveLength(3);
    expect(out.map((i) => i.word).sort()).toEqual(["α", "α", "β"]);
  });

  it("es determinista (misma semilla → mismo orden)", () => {
    const items = [
      mk("α", "MULTIPLE_CHOICE"),
      mk("α", "TRANSLATION"),
      mk("β", "MULTIPLE_CHOICE"),
    ];
    const a = interleaveLessonExercises(items, "k").map((i) => i.word);
    const b = interleaveLessonExercises(items, "k").map((i) => i.word);
    expect(a).toEqual(b);
  });
});

describe("mergeTinyCategories", () => {
  it("absorbe una categoría diminuta en la anterior", () => {
    // `verbo-a` tenía una sola entrada y producía una "lección" de 2 ejercicios.
    const out = mergeTinyCategories(
      new Map([
        ["comida", [1, 2, 3, 4]],
        ["verbo-a", [5]],
      ]),
    );
    expect([...out.keys()]).toEqual(["comida"]);
    expect(out.get("comida")).toEqual([1, 2, 3, 4, 5]);
  });

  it("si la primera es diminuta, se funde hacia adelante", () => {
    const out = mergeTinyCategories(
      new Map([
        ["fecha", [1]],
        ["mes", [2, 3, 4, 5]],
      ]),
    );
    expect([...out.keys()]).toEqual(["mes"]);
    expect(out.get("mes")).toEqual([1, 2, 3, 4, 5]);
  });

  it("deja intactas las categorías con tamaño suficiente", () => {
    const input = new Map([
      ["a", [1, 2, 3]],
      ["b", [4, 5, 6]],
    ]);
    expect(mergeTinyCategories(input)).toEqual(input);
  });

  it("no pierde entradas", () => {
    const out = mergeTinyCategories(
      new Map([["a", [1, 2, 3]], ["b", [4]], ["c", [5]], ["d", [6, 7, 8]]]),
    );
    const total = [...out.values()].flat().length;
    expect(total).toBe(8);
  });
});
