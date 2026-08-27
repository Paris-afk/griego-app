import { db } from "@/shared/lib/db";

// Lecturas de BD del feature catalog (ARCHITECTURE.md §3.1: queries.ts).
// Devuelven la jerarquía del curso (Course → Level → Module → Lesson → Exercise)
// tal como la dejó el seed (Fase 1).

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

// El mapa del curso: el curso activo con sus niveles y módulos (con conteo de
// lecciones) para la pantalla «Curso» (SCREENS.md §2).
export async function getCourseMap() {
  return db.course.findFirst({
    where: { isActive: true },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      levels: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          order: true,
          modules: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              _count: { select: { lessons: true } },
            },
          },
        },
      },
    },
  });
}

// Un módulo con sus lecciones (conteo de ejercicios) para la pantalla «Módulo».
export async function getModule(moduleId: string) {
  return db.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      title: true,
      order: true,
      level: {
        select: { id: true, name: true, order: true, course: { select: { id: true, title: true } } },
      },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          kind: true,
          _count: { select: { exercises: true } },
        },
      },
    },
  });
}

// Las 24 letras del alfabeto (referencia, Fase 4) — ordenadas.
export async function getAlphabet() {
  return db.alphabetLetter.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      uppercase: true,
      lowercase: true,
      nameGreek: true,
      nameTranslit: true,
      ipa: true,
      equivalentEs: true,
      transferencia: true,
      note: true,
    },
  });
}

// Una lección con su contexto (curso/level/módulo) y sus ejercicios (en orden).
// Los renderers de los ejercicios viven en el feature `exercises` (Fase 3).
export async function getLesson(lessonId: string) {
  return db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      order: true,
      kind: true,
      module: {
        select: {
          id: true,
          title: true,
          level: { select: { id: true, name: true, course: { select: { id: true, title: true } } } },
        },
      },
      exercises: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, schemaJson: true, order: true },
      },
    },
  });
}

// La lección «continuar» — la primera lección del primer módulo. Es lo que
// empuja la home. La progresión real (próxima lección según progreso) es del
// feature `progress` (Fase 6).
export async function getContinuation() {
  const mod = await db.module.findFirst({
    where: { level: { course: { isActive: true } } },
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });
  if (!mod) return null;
  const lesson = await db.lesson.findFirst({
    where: { moduleId: mod.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      order: true,
      _count: { select: { exercises: true } },
    },
  });
  if (!lesson) return null;
  return { lesson, module: mod };
}

// Palabra del día — una entrada de vocabulario elegida de forma determinista
// según el día, para que no cambie entre peticiones del mismo día.
export async function getWordOfTheDay() {
  const count = await db.vocabularyEntry.count();
  if (count === 0) return null;
  const today = new Date();
  const seed =
    today.getFullYear() * 1000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  const index = seed % count;
  const [entry] = await db.vocabularyEntry.findMany({
    skip: index,
    take: 1,
    select: { term: true, transliteration: true, translation: true },
  });
  return entry ?? null;
}

