import { normalizeForComparison } from "../../normalize";
import type { ValidationResult } from "../module";
import type { Autocomplete } from "./schema";

// El input es la palabra reconstruida. Los huecos están puestos en las letras
// ambiguas a propósito, así que la etiqueta del error dice cuál se confundió.
export function validateAutocomplete(
  exercise: Autocomplete,
  input: unknown,
): ValidationResult {
  const typed = typeof input === "string" ? input : "";
  const isCorrect = typed === exercise.answer;
  const tags: string[] = [];

  if (!isCorrect && typed.length === exercise.answer.length) {
    if (normalizeForComparison(typed) === normalizeForComparison(exercise.answer)) {
      tags.push("acento_faltante");
    } else {
      for (const i of exercise.blanks) {
        const got = typed[i];
        const want = exercise.answer[i];
        if (got === want) continue;
        if ("ηιυ".includes(want)) tags.push("confusion_i");
        else if ("οω".includes(want)) tags.push("confusion_omicron_omega");
      }
    }
  }
  return { isCorrect, errorTags: [...new Set(tags)], correct: exercise.answer };
}
