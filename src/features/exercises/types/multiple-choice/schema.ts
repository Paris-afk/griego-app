import { z } from "zod";
import { Base } from "../base";

export const MultipleChoiceSchema = Base.extend({
  type: z.literal("multiple_choice"),
  prompt: z.object({
    text: z.string().optional(),
    image: z.string().optional(),
    // Ilustración offline. El emoji es el primario: funciona sin red y sin
    // riesgo de licencia (ver shared/ui/vocab-image.tsx).
    emoji: z.string().optional(),
  }),
  options: z
    .array(z.object({ text: z.string(), image: z.string().optional() }))
    .min(2),
  answer: z.string(),
});

export type MultipleChoice = z.infer<typeof MultipleChoiceSchema>;

// La escalera de dificultad (EXERCISES.md §5): con dominio bajo se muestran
// MENOS opciones. Fallar y que vuelva con las mismas cuatro no es andamiaje.
export function optionsForDifficulty(
  options: MultipleChoice["options"],
  answer: string,
  difficulty: "easy" | "medium" | "hard",
): MultipleChoice["options"] {
  if (difficulty !== "easy" || options.length <= 2) return options;
  const correct = options.find((o) => o.text === answer);
  const other = options.find((o) => o.text !== answer);
  return correct && other ? [correct, other] : options;
}
