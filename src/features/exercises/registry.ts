import { multipleChoice } from "./types/multiple-choice";
import { fillBlank } from "./types/fill-blank";
import { orderWords } from "./types/order-words";
import { translation } from "./types/translation";
import { freeWriting } from "./types/free-writing";
import { readingComprehension } from "./types/reading-comprehension";
import { alphabetDrill } from "./types/alphabet-drill";
import { repeatWord } from "./types/repeat-word";

import type { Exercise } from "./schemas";
import type { ExerciseModules, ValidationResult } from "./types/module";

// Único índice de todos los tipos de ejercicio (patrón 1 de ARCHITECTURE.md
// §3.2). Agregar un tipo = una carpeta en `types/` + una línea aquí.
export const exerciseRegistry: ExerciseModules = {
  multiple_choice: multipleChoice,
  fill_blank: fillBlank,
  order_words: orderWords,
  translation,
  free_writing: freeWriting,
  reading_comprehension: readingComprehension,
  alphabet_drill: alphabetDrill,
  repeat_word: repeatWord,
};

// Despacho discriminado de la validación determinista. Al recorrer `exercise`
// por su `type` (discriminator de la unión) TS estrecha cada módulo y evitamos
// el problema de invocar una función de unión con un argumento de unión.
export function validateExercise(
  exercise: Exercise,
  input: unknown,
): ValidationResult {
  switch (exercise.type) {
    case "multiple_choice":
      return multipleChoice.validate(exercise, input);
    case "fill_blank":
      return fillBlank.validate(exercise, input);
    case "order_words":
      return orderWords.validate(exercise, input);
    case "translation":
      return translation.validate(exercise, input);
    case "free_writing":
      return freeWriting.validate(exercise, input);
    case "reading_comprehension":
      return readingComprehension.validate(exercise, input);
    case "alphabet_drill":
      return alphabetDrill.validate(exercise, input);
    case "repeat_word":
      return repeatWord.validate(exercise, input);
  }
}

// La palabra griega que se debe pronunciar (auto-play del reproductor, Fase 4.5).
export function exerciseSpokenText(exercise: Exercise): string | undefined {
  switch (exercise.type) {
    case "multiple_choice":
      return exercise.prompt.text;
    case "translation":
      return exercise.answer;
    case "fill_blank":
      return exercise.answer;
    case "order_words":
      return exercise.answer.join("");
    case "alphabet_drill":
      return exercise.letter;
    default:
      return undefined;
  }
}

export type { ExerciseModules } from "./types/module";
