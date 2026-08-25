import { z } from "zod";

// Contrato tipado de los ejercicios (ARCHITECTURE.md §5.1).
// Unión discriminada por `type`: el seed falla ruidosamente si un CSV genera un
// ejercicio inválido, y el runtime valida antes de renderizar.
//
// NOTA (Fase 0): aquí solo vive el SCHEMA — el contrato antes que el contenido.
// El renderer y el validador de cada tipo llegan en la Fase 3, y siguiendo el
// patrón 1 de ARCHITECTURE.md §3.2 cada tipo se moverá a types/<tipo>.tsx con
// sus tres piezas juntas. El registro (registry.ts) es Fase 3.

const Base = z.object({
  instruction: z.string(),
  points: z.number().int().positive().default(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
});

const MultipleChoice = Base.extend({
  type: z.literal("multiple_choice"),
  prompt: z.object({ text: z.string().optional(), image: z.string().optional() }),
  options: z.array(z.object({ text: z.string(), image: z.string().optional() })).min(2),
  answer: z.string(),
});

const FillBlank = Base.extend({
  type: z.literal("fill_blank"),
  prompt: z.object({ text: z.string() }),
  answer: z.string(),
  accept: z.array(z.string()).default([]),
});

const OrderWords = Base.extend({
  type: z.literal("order_words"),
  prompt: z.object({ text: z.string() }),
  words: z.array(z.string()).min(2),
  answer: z.array(z.string()),
});

const Translation = Base.extend({
  type: z.literal("translation"),
  prompt: z.object({ text: z.string() }),
  answer: z.string(),
  accept: z.array(z.string()).default([]),
});

const FreeWriting = Base.extend({
  type: z.literal("free_writing"),
  prompt: z.object({ text: z.string() }),
  answer: z.string().optional(),
  accept: z.array(z.string()).default([]),
  aiTutor: z.boolean().default(true),
});

const ReadingComprehension = Base.extend({
  type: z.literal("reading_comprehension"),
  prompt: z.object({ text: z.string() }),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).min(2),
      answer: z.string(),
    }),
  ),
});

const AlphabetDrill = Base.extend({
  type: z.literal("alphabet_drill"),
  letter: z.string(),
  prompt: z.object({ text: z.string().optional() }),
  answer: z.string(),
  accept: z.array(z.string()).default([]),
});

// Fase 8, pendiente de proveedor de STT — ver ARCHITECTURE.md §1.1.
const RepeatWord = Base.extend({
  type: z.literal("repeat_word"),
  prompt: z.object({ text: z.string() }),
  target: z.string(),
});

export const ExerciseSchema = z.discriminatedUnion("type", [
  MultipleChoice,
  FillBlank,
  OrderWords,
  Translation,
  FreeWriting,
  ReadingComprehension,
  AlphabetDrill,
  RepeatWord,
]);

export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseType = Exercise["type"];

// Las 8 piezas de la unión. `satisfies` garantiza en tiempo de compilación que
// la lista es exactamente el conjunto de tipos de ExerciseSchema
// (patrón 1 de ARCHITECTURE.md §3.2 — un Record<ExerciseType, ...> completo).
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
