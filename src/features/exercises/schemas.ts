import { z } from "zod";

import { MultipleChoiceSchema } from "./types/multiple-choice/schema";
import { FillBlankSchema } from "./types/fill-blank/schema";
import { OrderWordsSchema } from "./types/order-words/schema";
import { TranslationSchema } from "./types/translation/schema";
import { FreeWritingSchema } from "./types/free-writing/schema";
import { ReadingComprehensionSchema } from "./types/reading-comprehension/schema";
import { AlphabetDrillSchema } from "./types/alphabet-drill/schema";
import { RepeatWordSchema } from "./types/repeat-word/schema";
import { ConceptSchema } from "./types/concept/schema";
import { MatchPairsSchema } from "./types/match-pairs/schema";
import { GenderSortSchema } from "./types/gender-sort/schema";
import { ListenChooseSchema } from "./types/listen-choose/schema";
import { AutocompleteSchema } from "./types/autocomplete/schema";
import { CasePairsSchema } from "./types/case-pairs/schema";
import { MemoryGridSchema } from "./types/memory-grid/schema";
import { SpeedRoundSchema } from "./types/speed-round/schema";
import { DictationSchema } from "./types/dictation/schema";

// Unión discriminada por `type` (ARCHITECTURE.md §5.1). Es el contrato del
// `schemaJson`: se valida en seed time y en runtime antes de renderizar.
export const ExerciseSchema = z.discriminatedUnion("type", [
  MultipleChoiceSchema,
  FillBlankSchema,
  OrderWordsSchema,
  TranslationSchema,
  FreeWritingSchema,
  ReadingComprehensionSchema,
  AlphabetDrillSchema,
  RepeatWordSchema,
  ConceptSchema,
  MatchPairsSchema,
  GenderSortSchema,
  ListenChooseSchema,
  AutocompleteSchema,
  CasePairsSchema,
  MemoryGridSchema,
  SpeedRoundSchema,
  DictationSchema,
]);

export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseType = Exercise["type"];

// Lista completa. `satisfies` asegura que coincide con las piezas de la unión
// (patrón 1 de §3.2 — un Record<ExerciseType, ...> completo se verifica en TS).
export const exerciseTypes = [
  "multiple_choice",
  "fill_blank",
  "order_words",
  "translation",
  "free_writing",
  "reading_comprehension",
  "alphabet_drill",
  "repeat_word",
  "concept",
  "match_pairs",
  "gender_sort",
  "listen_choose",
  "autocomplete",
  "case_pairs",
  "memory_grid",
  "speed_round",
  "dictation",
] as const satisfies readonly ExerciseType[];

export type ExerciseTypeList = typeof exerciseTypes;
