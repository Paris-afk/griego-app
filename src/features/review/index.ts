// API pública del feature review — dominio, SM-2 y "dónde fallas" (Fase 6).
// Ver EXERCISES.md §5: la dificultad progresiva y el repaso son la misma
// feature, unidas por el puntaje de dominio.

export { getWeakWords, getErrorGroups, getDueCount } from "./queries";
export type { WeakWord, ErrorGroup } from "./queries";

export { recordReview } from "./actions";

export { nextSm2, qualityFromResult, SM2_INITIAL } from "./lib/sm2";
export type { Sm2State, Sm2Outcome } from "./lib/sm2";

export { WeakWordsPanel } from "./components/weak-words-panel";
