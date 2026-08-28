import { compareText, normalizeForComparison } from "../../normalize";
import type { ValidationResult } from "../module";
import type { Autocomplete } from "./schema";

// Los huecos están puestos en las letras ambiguas a propósito, así que el error
// que importa es CUÁL letra se eligió — no si le puso el acento.
//
// Escribir «ε» donde iba «έ» NO es un fallo: se acepta y se señala, igual que
// en el resto de tipos (ARCHITECTURE.md §5.3). Fallar una palabra entera por
// una tilde desanima sin enseñar nada.
export function validateAutocomplete(
  exercise: Autocomplete,
  input: unknown,
): ValidationResult {
  const typed = typeof input === "string" ? input.trim() : "";
  const base = compareText(exercise.answer, [], typed);
  const tags = [...base.errorTags];

  // Si acertó salvo acentos, ya está dicho con `acento_faltante`. Solo cuando
  // la letra en sí está mal se etiqueta la confusión concreta.
  if (!base.isCorrect) {
    const got = Array.from(normalizeForComparison(typed));
    const want = Array.from(normalizeForComparison(exercise.answer));
    if (got.length === want.length) {
      for (const i of exercise.blanks) {
        if (got[i] === want[i]) continue;
        if ("ηιυ".includes(want[i])) tags.push("confusion_i");
        else if ("οω".includes(want[i])) tags.push("confusion_omicron_omega");
      }
    }
  }

  return {
    isCorrect: base.isCorrect,
    errorTags: [...new Set(tags)],
    correct: exercise.answer,
  };
}
