// API pública del feature lesson-player — el reproductor en modo foco.
export { LessonExperience } from "./lesson-experience";
export type { LessonExperienceProps } from "./lesson-experience";
export { checkAnswer, completeLesson } from "./actions";
export type { CheckAnswerResult } from "./actions";
export { getLessonPlayback } from "./queries";
