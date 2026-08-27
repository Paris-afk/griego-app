import { z } from "zod";

import { MultipleChoiceSchema } from "./types/multiple-choice/schema";
import { FillBlankSchema } from "./types/fill-blank/schema";
import { OrderWordsSchema } from "./types/order-words/schema";
import { TranslationSchema } from "./types/translation/schema";
import { FreeWritingSchema } from "./types/free-writing/schema";
import { ReadingComprehensionSchema } from "./types/reading-comprehension/schema";
import { AlphabetDrillSchema } from "./types/alphabet-drill/schema";
import { RepeatWordSchema } from "./types/repeat-word/schema";

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
] as const satisfies readonly ExerciseType[];

export type ExerciseTypeList = typeof exerciseTypes;
