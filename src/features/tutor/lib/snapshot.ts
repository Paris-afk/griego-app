import { ERROR_TAGS, TAG_LETTERS, type ErrorTag } from "@/shared/lib/error-tags";

// Cálculo del LearnerSnapshot (ARCHITECTURE.md §6.3) — función PURA, sin
// Prisma, para poder testearla sin base de datos.
//
// Qué es y qué NO es:
// · SÍ: el resumen lento del alumno (errores recurrentes, letras débiles,
//   palabras dominadas). Da TONO y ÉNFASIS al prompt del profesor.
// · NO: la fuente de los hechos contables que se le muestran al alumno. Eso lo
//   calcula `progress-note.ts` fresco en cada render — si saliera de aquí,
//   volvería a envejecer mal, que es el bug que evitamos en la Fase 5.

export interface SnapshotInput {
  /** Etiquetas de todas las respuestas incorrectas recientes, aplanadas. */
  errorTags: string[];
  /** Entradas de vocabulario respondidas bien al menos una vez. */
  masteredCount: number;
  currentModuleId?: string | null;
  level?: string;
}

export interface SnapshotResult {
  recurringErrors: { tag: ErrorTag; count: number }[];
  weakLetters: string[];
  masteredCount: number;
  summaryText: string;
}

/** Cuántas veces debe repetirse un error para considerarse "recurrente". */
const RECURRING_THRESHOLD = 2;
const MAX_RECURRING = 4;
const MAX_WEAK_LETTERS = 5;

export function buildSnapshot(input: SnapshotInput): SnapshotResult {
  const counts = new Map<ErrorTag, number>();
  for (const tag of input.errorTags) {
    if ((ERROR_TAGS as readonly string[]).includes(tag)) {
      const known = tag as ErrorTag;
      counts.set(known, (counts.get(known) ?? 0) + 1);
    }
  }

  const recurringErrors = [...counts.entries()]
    .filter(([, count]) => count >= RECURRING_THRESHOLD)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_RECURRING)
    .map(([tag, count]) => ({ tag, count }));

  // Las letras se derivan de los errores recurrentes, no se cuentan aparte:
  // una letra es "débil" porque provoca fallos, no por aparecer mucho.
  const letters: string[] = [];
  for (const { tag } of recurringErrors) {
    for (const letter of TAG_LETTERS[tag] ?? []) {
      if (!letters.includes(letter)) letters.push(letter);
    }
  }

  return {
    recurringErrors,
    weakLetters: letters.slice(0, MAX_WEAK_LETTERS),
    masteredCount: input.masteredCount,
    summaryText: renderSummary({
      level: input.level ?? "A1",
      masteredCount: input.masteredCount,
      recurringErrors,
      weakLetters: letters.slice(0, MAX_WEAK_LETTERS),
    }),
  };
}

// ~80 tokens, listo para inyectar. La razón de existir del snapshot: mandar el
// historial crudo sería caro, lento y ruidoso (§6.3).
function renderSummary(data: {
  level: string;
  masteredCount: number;
  recurringErrors: { tag: ErrorTag; count: number }[];
  weakLetters: string[];
}): string {
  const parts = [`Nivel ${data.level}`, `${data.masteredCount} palabras dominadas`];
  if (data.recurringErrors.length > 0) {
    parts.push(
      `errores recurrentes: ${data.recurringErrors
        .map((e) => `${e.tag} (${e.count})`)
        .join(", ")}`,
    );
  }
  if (data.weakLetters.length > 0) {
    parts.push(`letras débiles: ${data.weakLetters.join(", ")}`);
  }
  return parts.join(" · ");
}
