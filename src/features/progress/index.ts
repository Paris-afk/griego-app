// API pública del feature progress — estadísticas del alumno (Fase 6).
// Todo se deriva de UserAnswer/UserProgress: no hay contadores que puedan
// quedar desincronizados con el historial real.

export { getProgressStats } from "./queries";
export type { ProgressStats } from "./queries";
