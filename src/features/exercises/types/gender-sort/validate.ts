import type { ValidationResult } from "../module";
import type { GenderSort } from "./schema";

// El input es { [word]: artículo elegido }. Se acierta si TODAS coinciden.
// `errorTags` distingue el neutro del resto: es lo único que no transfiere del
// español (CURRICULUM.md §4), así que merece su propia etiqueta.
export function validateGenderSort(
  exercise: GenderSort,
  input: unknown,
): ValidationResult {
  const picked = (input ?? {}) as Record<string, unknown>;
  const wrong = exercise.items.filter((it) => picked[it.word] !== it.article);
  const tags = new Set<string>();
  for (const item of wrong) {
    tags.add(item.article === "το" ? "genero_neutro" : "genero_incorrecto");
  }
  return {
    isCorrect: wrong.length === 0,
    errorTags: [...tags],
    correct: exercise.items.map((i) => `${i.article} ${i.word}`).join(" · "),
  };
}
