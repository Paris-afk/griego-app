import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth";
import { getLessonPlayback, LessonExperience } from "@/features/lesson-player";

// Modo foco (SCREENS.md §2): pantalla completa, sin navegación. El motor de
// ejercicios vive en LessonExperience (Fase 3).
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const playback = await getLessonPlayback(lessonId);
  if (!playback) notFound();

  const { lesson, correctIds, initialScore, streak } = playback;

  return (
    <LessonExperience
      lessonId={lesson.id}
      title={lesson.title}
      moduleId={lesson.module.id}
      exercises={lesson.exercises.map((e) => ({
        id: e.id,
        schemaJson: e.schemaJson,
        correct: correctIds.has(e.id),
      }))}
      initialScore={initialScore}
      streak={streak}
    />
  );
}
