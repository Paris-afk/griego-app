import { db } from "@/shared/lib/db";

// Lecturas de BD del feature catalog (ARCHITECTURE.md §3.1: queries.ts).
// En la Fase 0 la BD está vacía: getCourses() devuelve [] — la página
// se encarga de renderizar el estado vacío. El seed es Fase 1.

export async function getCourses() {
  return db.course.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      isActive: true,
    },
  });
}
