import { describe, expect, it } from "vitest";

import { validateMultipleChoice } from "@/features/exercises/types/multiple-choice/validate";
import { validateTranslation } from "@/features/exercises/types/translation/validate";
import { ExerciseSchema, type Exercise } from "@/features/exercises/schemas";

// Se estrecha el tipo por `type` en vez de devolver la unión entera: así el
// validador concreto acepta el argumento sin castear. Y nada de `as Exercise`
// sobre el objeto de entrada — es lo que ocultaba que a `translation` le
// faltaba `direction`, un campo obligatorio de su schema.
type OfType<T extends Exercise["type"]> = Extract<Exercise, { type: T }>;

function parseAs<T extends Exercise["type"]>(type: T, input: unknown): OfType<T> {
  const parsed = ExerciseSchema.parse(input);
  if (parsed.type !== type) throw new Error(`Se esperaba ${type}, llegó ${parsed.type}`);
  return parsed as OfType<T>;
}

function mc(): OfType<"multiple_choice"> {
  return parseAs("multiple_choice", {
    type: "multiple_choice",
    instruction: "¿Qué significa?",
    points: 10,
    difficulty: "easy",
    prompt: { text: "ψωμί" },
    options: [{ text: "pan" }, { text: "agua" }, { text: "leche" }],
    answer: "pan",
  });
}

function translation(): OfType<"translation"> {
  return parseAs("translation", {
    type: "translation",
    instruction: "Escribe",
    points: 10,
    difficulty: "easy",
    prompt: { text: "pan" },
    direction: "es→el",
    answer: "ψωμί",
    accept: [],
  });
}

describe("validateMultipleChoice", () => {
  it("correcto si elige la opción canónica", () => {
    const r = validateMultipleChoice(mc(), "pan");
    expect(r.isCorrect).toBe(true);
    expect(r.correct).toBe("pan");
  });
  it("incorrecto en caso contrario", () => {
    expect(validateMultipleChoice(mc(), "agua").isCorrect).toBe(false);
  });
});

describe("validateTranslation", () => {
  it("correcto y correcto-con-observación", () => {
    expect(validateTranslation(translation(), "ψωμί").isCorrect).toBe(true);
    const sinAcento = validateTranslation(translation(), "ψωμι");
    expect(sinAcento.isCorrect).toBe(true);
    expect(sinAcento.errorTags).toContain("acento_faltante");
    expect(validateTranslation(translation(), "agua").isCorrect).toBe(false);
  });
});
