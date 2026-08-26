import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";

import { getCurrentUser } from "@/features/auth";
import { getLesson } from "@/features/catalog";
import { ProgressBar } from "@/shared/ui";

// Modo foco (SCREENS.md §2): pantalla completa, sin navegación.
// El reproductor de ejercicios (renderers + validación) es la Fase 3; aquí la
// ruta ya es navegable y muestra el contexto real de la lección.
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lesson = await getLesson(lessonId);
  if (!lesson) notFound();

  const total = lesson.exercises.length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-[22px] pb-8 pt-[24px]">
      <div className="flex items-center gap-2">
        <Link
          href={`/course/${lesson.module.id}`}
          aria-label="Salir de la lección"
          className="flex size-11 items-center justify-center text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
        >
          <X width={21} height={21} strokeWidth={2.2} aria-hidden />
        </Link>
        <ProgressBar value={0} max={total} className="ml-1.5 flex-grow bg-[var(--color-border-soft)]" />
        <span className="text-[12px] tabular-nums tracking-[0.4px] text-[var(--color-text-soft)]">
          0/{total}
        </span>
      </div>

      <div className="flex flex-col items-start gap-2 pt-12">
        <div className="text-[11px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
          {lesson.module.level.course.title} · {lesson.module.title}
        </div>
        <h1 className="font-display text-[30px] font-medium leading-tight tracking-[-0.3px] text-[var(--color-text)]">
          {lesson.title}
        </h1>
        <p className="text-[15px] text-[var(--color-text-soft)]">
          {total} {total === 1 ? "ejercicio" : "ejercicios"} · Tabla de pista lista.
        </p>
      </div>

      <div className="mt-8 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-[15px] leading-relaxed text-[var(--color-text)]">
          El reproductor de ejercicios (preguntas, respuestas y validación) se
          implementa en la <strong>Fase 3</strong>. La navegación hasta aquí ya
          funciona con contenido real.
        </p>
        <Link
          href={`/course/${lesson.module.id}`}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white hover:bg-[var(--color-primary-strong)]"
        >
          <ChevronLeft width={17} height={17} strokeWidth={2.2} aria-hidden />
          Volver al módulo
        </Link>
      </div>
    </div>
  );
}
