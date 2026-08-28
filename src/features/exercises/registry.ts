import { multipleChoice } from "./types/multiple-choice";
import { fillBlank } from "./types/fill-blank";
import { orderWords } from "./types/order-words";
import { translation } from "./types/translation";
import { freeWriting } from "./types/free-writing";
import { readingComprehension } from "./types/reading-comprehension";
import { alphabetDrill } from "./types/alphabet-drill";
import { repeatWord } from "./types/repeat-word";
import { concept } from "./types/concept";
import { matchPairs } from "./types/match-pairs";
import { genderSort } from "./types/gender-sort";
import { listenChoose } from "./types/listen-choose";
import { autocomplete } from "./types/autocomplete";
import { casePairs } from "./types/case-pairs";
import { memoryGrid } from "./types/memory-grid";
import { speedRound } from "./types/speed-round";
import { dictation } from "./types/dictation";

import type { ExerciseModules } from "./types/module";

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
  concept,
  match_pairs: matchPairs,
  gender_sort: genderSort,
  listen_choose: listenChoose,
  autocomplete,
  case_pairs: casePairs,
  memory_grid: memoryGrid,
  speed_round: speedRound,
  dictation,
};

// El despacho de validación vive en `validators.ts` (TS puro): este archivo
// importa los renderers, y el servidor no debe arrastrar React solo para
// corregir una respuesta. Se re-exporta para no romper a quien ya lo importaba.
export {
  validateExercise,
  exerciseSpokenText,
  isInformationalType,
  INFORMATIONAL_TYPES,
} from "./validators";

export type { ExerciseModules } from "./types/module";
