// Catálogo canónico de `errorTags` — TS puro, sin dependencias.
//
// Vive en `shared/` y no en `features/exercises` porque lo comparten dos
// features: exercises los PRODUCE y tutor los CONSUME. Es la regla 4 de
// ARCHITECTURE.md §3.1 — lo que necesitan dos features baja a shared.
// (Además, dejarlo en el feature obligaba a importarlo por su index.ts, que
// arrastra los renderers: una función pura del servidor acababa dependiendo
// de React.)
//
// Los produce la validación determinista y los consumen el LearnerSnapshot, el
// puente contrastivo y la nota de progreso. Tenerlos en un solo sitio evita que
// se escriban con variantes ("acentoFaltante" vs "acento_faltante") que romperían
// los conteos en silencio.
//
// INVARIANTE IMPORTANTE: ninguna etiqueta puede ser subcadena de otra.
// `UserAnswer.errorTags` es un CSV y las consultas cuentan con `contains`, así
// que si una fuera prefijo de otra los conteos se contaminarían. Hay un test
// que lo comprueba.

export const ERROR_TAGS = [
  "acento_faltante",
  "sigma_final",
  "confusion_i",
  "confusion_omicron_omega",
  "genero_incorrecto",
  "genero_neutro",
  "typo_aprox",
  "confusion_b_v",
] as const;

export type ErrorTag = (typeof ERROR_TAGS)[number];

export function isKnownErrorTag(tag: string): tag is ErrorTag {
  return (ERROR_TAGS as readonly string[]).includes(tag);
}

/** Las letras que cada etiqueta pone en duda — alimenta `weakLetters`. */
export const TAG_LETTERS: Partial<Record<ErrorTag, string[]>> = {
  confusion_i: ["η", "ι", "υ"],
  confusion_omicron_omega: ["ο", "ω"],
  sigma_final: ["ς"],
  confusion_b_v: ["β"],
};
