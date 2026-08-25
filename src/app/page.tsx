import Link from "next/link";

import { getCourses } from "@/features/catalog";
import { Button, buttonVariants } from "@/shared/ui";

export default async function HomePage() {
  // La BD está vacía en la Fase 0: el seed es Fase 1. Mostrar el estado vacío
  // es el resultado correcto (PLAN.md §4 — «Listo cuando»).
  const courses = await getCourses();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <header className="space-y-1">
        <p className="text-15 text-[var(--color-text-soft)]">Καλημέρα</p>
        <h1 className="font-display text-34 font-bold text-[var(--color-text)]">
          Griego App
        </h1>
      </header>

      {courses.length === 0 ? (
        <section className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-display text-22 font-bold text-[var(--color-text)]">
            Aún no hay cursos disponibles
          </h2>
          <p className="mt-2 text-17 text-[var(--color-text-soft)]">
            El contenido (griego A1) se carga en la Fase 1 con el seed. Por
            ahora la base de datos está vacía — esto es el estado vacío correcto.
          </p>
          <div className="mt-5">
            <Button variant="secondary" disabled>
              Continuar
            </Button>
          </div>
        </section>
      ) : (
        <ul className="space-y-2">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/courses/${course.id}`}
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                {course.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-auto text-13 text-[var(--color-text-soft)]">
        Construido con la dirección «Ánfora».
      </footer>
    </main>
  );
}
