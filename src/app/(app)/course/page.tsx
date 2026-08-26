import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getCourseMap } from "@/features/catalog";

export default async function CoursePage() {
  const course = await getCourseMap();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="border-b border-[var(--color-border-soft)] pb-3.5">
        <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.4px] text-[var(--color-text)]">
          Curso
        </h1>
        <div className="mt-1 text-[13px] tracking-[0.2px] text-[var(--color-text-soft)]">
          {course?.title}
        </div>
      </header>

      {!course || course.levels.length === 0 ? (
        <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-[15px] text-[var(--color-text-soft)]">
            No hay cursos activos. Corre el seed para cargar el contenido.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {course.levels.map((level) => (
            <section key={level.id} className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
                NIVEL {level.name}
              </h2>
              <ul className="flex flex-col gap-2">
                {level.modules.map((mod) => (
                  <li key={mod.id}>
                    <Link
                      href={`/course/${mod.id}`}
                      className="flex items-center gap-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-card bg-[var(--color-border-soft)] font-display text-[15px] font-medium text-[var(--color-primary-strong)]">
                        {mod.order}
                      </span>
                      <span className="flex flex-col gap-[2px] flex-grow">
                        <span className="font-display text-[18px] font-medium leading-tight">
                          {mod.title}
                        </span>
                        <span className="text-[12px] text-[var(--color-text-soft)]">
                          {mod._count.lessons}{" "}
                          {mod._count.lessons === 1 ? "lección" : "lecciones"} · Nuevo
                        </span>
                      </span>
                      <ChevronRight width={18} height={18} strokeWidth={2.2} className="shrink-0 text-[#938677]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
