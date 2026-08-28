// Despacho de la validación determinista — TS PURO, sin React.
//
// Por qué existe separado de `registry.ts` (patrón 1 de ARCHITECTURE.md §3.2):
// el registro importa los `renderer.tsx` de cada tipo, así que importarlo
// arrastra React. Pero la validación corre en el SERVIDOR (Server Actions) y
// en los tests, donde los renderers no pintan nada y solo estorban.
//
// Es el mismo motivo por el que `schema.ts` es TS puro y va en su propio
// archivo: cada pieza de un tipo debe poder importarse sin las otras dos.
// La co-locación sigue intacta — una carpeta por tipo —, lo que se separa es
// el ÍNDICE, no el módulo.

import { validateMultipleChoice } from "./types/multiple-choice/validate";
import { validateFillBlank } from "./types/fill-blank/validate";
import { validateOrderWords } from "./types/order-words/validate";
import { validateTranslation } from "./types/translation/validate";
import { validateFreeWriting } from "./types/free-writing/validate";
import { validateReadingComprehension } from "./types/reading-comprehension/validate";
import { validateAlphabetDrill } from "./types/alphabet-drill/validate";
import { validateRepeatWord } from "./types/repeat-word/validate";
import { validateConcept } from "./types/concept/validate";
import { validateMatchPairs } from "./types/match-pairs/validate";
import { validateGenderSort } from "./types/gender-sort/validate";
import { validateListenChoose } from "./types/listen-choose/validate";
import { validateAutocomplete } from "./types/autocomplete/validate";
import { validateCasePairs } from "./types/case-pairs/validate";
import { validateMemoryGrid } from "./types/memory-grid/validate";
import { validateSpeedRound } from "./types/speed-round/validate";
import { validateDictation } from "./types/dictation/validate";

import type { Exercise, ExerciseType } from "./schemas";
import type { ValidationResult } from "./types/module";

// Tipos informativos: no puntúan y no se pueden fallar (`concept`). Vive en la
// capa pura porque es un hecho del contenido, no de la interfaz — el servidor
// también necesita saberlo al registrar la respuesta.
export const INFORMATIONAL_TYPES = new Set<ExerciseType>(["concept"]);

export function isInformationalType(type: ExerciseType): boolean {
  return INFORMATIONAL_TYPES.has(type);
}

// Despacho discriminado: al recorrer `exercise` por su `type` TS estrecha cada
// caso, y así evitamos invocar una función de unión con un argumento de unión.
export function validateExercise(
  exercise: Exercise,
  input: unknown,
): ValidationResult {
  switch (exercise.type) {
    case "multiple_choice":
      return validateMultipleChoice(exercise, input);
    case "fill_blank":
      return validateFillBlank(exercise, input);
    case "order_words":
      return validateOrderWords(exercise, input);
    case "translation":
      return validateTranslation(exercise, input);
    case "free_writing":
      return validateFreeWriting(exercise, input);
    case "reading_comprehension":
      return validateReadingComprehension(exercise, input);
    case "alphabet_drill":
      return validateAlphabetDrill(exercise, input);
    case "repeat_word":
      return validateRepeatWord(exercise, input);
    case "concept":
      return validateConcept(exercise, input);
    case "match_pairs":
      return validateMatchPairs(exercise, input);
    case "gender_sort":
      return validateGenderSort(exercise, input);
    case "listen_choose":
      return validateListenChoose(exercise, input);
    case "autocomplete":
      return validateAutocomplete(exercise, input);
    case "case_pairs":
      return validateCasePairs(exercise, input);
    case "memory_grid":
      return validateMemoryGrid(exercise, input);
    case "speed_round":
      return validateSpeedRound(exercise, input);
    case "dictation":
      return validateDictation(exercise, input);
  }
}

// La palabra griega que debe sonar sola al aparecer el ejercicio (Fase 4.5).
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
    case "listen_choose":
      // El audio ES el enunciado: sin él no hay ejercicio.
      return exercise.answer;
    case "autocomplete":
      return exercise.answer;
    case "dictation":
      // El audio ES el ejercicio: sin él no hay nada que escribir.
      return exercise.answer;
    // Sin auto-play: el usuario controla el audio dentro del propio ejercicio
    // (match_pairs, memory_grid) o no hay una palabra única que pronunciar
    // (gender_sort, case_pairs, speed_round, concept).
    default:
      return undefined;
  }
}
