// API pública del feature tutor (ARCHITECTURE.md §3.1).
// La IA se usa POCO a propósito: solo en escritura abierta y errores de
// dictado. Los ejercicios normales usan la `nota` del contenido, escrita a
// mano (PLAN.md Fase 5).

export { getTutorFeedback, refreshLearnerSnapshot } from "./actions";
export type { TutorFeedback } from "./actions";

export { askTutor } from "./lib/tutor-client";
export type { TutorOutcome } from "./lib/tutor-client";

export { TutorResponseSchema } from "./schemas";
export type { TutorResponse } from "./schemas";

// Los hechos contables los genera el CÓDIGO, nunca la IA: cachear "es la 3ª vez
// esta semana" lo volvería falso con el tiempo (§6.2).
export { buildProgressNote } from "./lib/progress-note";
export type { ProgressNote } from "./lib/progress-note";

export { checkRateLimit } from "./lib/rate-limit";
export { buildSnapshot } from "./lib/snapshot";
export type { SnapshotInput, SnapshotResult } from "./lib/snapshot";
export type { LearnerContext, TutorTurn } from "./lib/prompt";
