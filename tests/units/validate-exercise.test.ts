import { describe, expect, it } from "vitest";

import { validateMultipleChoice } from "@/features/exercises/types/multiple-choice/validate";
import { validateTranslation } from "@/features/exercises/types/translation/validate";
import { ExerciseSchema, type Exercise } from "@/features/exercises/schemas";

function mc(): Exercise {
  return ExerciseSchema.parse({
    type: "multiple_choice",
    instruction: "¿Qué significa?",
    points: 10,
    difficulty: "easy",
    prompt: { text: "ψωμί" },
    options: [{ text: "pan" }, { text: "agua" }, { text: "leche" }],
    answer: "pan",
  } as Exercise);
}

function translation(): Exercise {
  return ExerciseSchema.parse({
    type: "translation",
    instruction: "Escribe",
    points: 10,
    difficulty: "easy",
    prompt: { text: "pan" },
    answer: "ψωμί",
    accept: [],
  } as Exercise);
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
