import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getModule } from "@/features/catalog";

const KIND_LABELS: Record<string, string> = {
  VOCABULARIO: "Vocabulario",
  GRAMATICA: "Gramática",
  ESCUCHA: "Escucha",
  LECTURA: "Lectura",
  CULTURA: "Cultura",
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const mod = await getModule(moduleId);
  if (!mod) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[24px]">
      <Link
        href="/course"
        className="inline-flex items-center gap-1 self-start py-1 text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft width={18} height={18} strokeWidth={2.2} aria-hidden />
        <span className="text-[14px]">Curso</span>
      </Link>

      <header className="border-b border-[var(--color-border-soft)] pb-3.5">
        <div className="text-[11px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
          {mod.level.course.title} · NIVEL {mod.level.name}
        </div>
        <h1 className="mt-1 font-display text-[30px] font-medium leading-tight tracking-[-0.3px] text-[var(--color-text)]">
          {mod.title}
        </h1>
        <div className="mt-1 text-[13px] text-[var(--color-text-soft)]">
          {mod.lessons.length}{" "}
          {mod.lessons.length === 1 ? "lección" : "lecciones"}
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        {mod.lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/lesson/${lesson.id}`}
              className="flex items-center gap-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
            >
              <span className="flex flex-col gap-[2px] flex-grow">
                <span className="font-display text-[18px] font-medium leading-tight">
                  {lesson.title}
                </span>
                <span className="text-[12px] text-[var(--color-text-soft)]">
                  {KIND_LABELS[lesson.kind] ?? lesson.kind} ·{" "}
                  {lesson._count.exercises}{" "}
                  {lesson._count.exercises === 1 ? "ejercicio" : "ejercicios"}
                </span>
              </span>
              <ChevronRight width={18} height={18} strokeWidth={2.2} className="shrink-0 text-[#938677]" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
