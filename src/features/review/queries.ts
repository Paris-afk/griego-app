import "server-only";

import { computeMastery, difficultyForMastery, isWeak } from "@/shared/lib/mastery";
import { ERROR_TAGS } from "@/shared/lib/error-tags";
import { db } from "@/shared/lib/db";

// Lecturas del feature review. Todo sale de `UserAnswer`, que se guarda desde
// la Fase 3: el dato lleva ahí semanas, solo faltaba agregarlo.

export interface WeakWord {
  term: string;
  translation: string;
  transliteration: string | null;
  audioUrl: string | null;
  mastery: number;
  difficulty: ReturnType<typeof difficultyForMastery>;
  attempts: number;
  failures: number;
}

export interface ErrorGroup {
  tag: string;
  label: string;
  count: number;
  /** Ejemplos concretos, para que el grupo no sea una abstracción. */
  examples: string[];
}

/** Cómo se nombra cada errorTag en la pantalla de "dónde fallas". */
const TAG_LABEL: Record<string, string> = {
  acento_faltante: "Acentos que faltan",
  sigma_final: "Sigma final (ς)",
  confusion_i: "Confundir η / ι / υ",
  confusion_omicron_omega: "Confundir ο con ω",
  genero_incorrecto: "Género equivocado",
  genero_neutro: "El neutro (το)",
  typo_aprox: "Teclazos",
  confusion_b_v: "Leer β como /b/",
};

const RECENT_WINDOW_DAYS = 30;

/**
 * Palabras flojas, de la más floja a la menos.
 *
 * El dominio se calcula sobre las respuestas, no se almacena: así no puede
 * quedar desincronizado con el historial real (mismo motivo por el que la nota
 * de progreso del tutor se calcula fresca).
 */
export async function getWeakWords(userId: string, limit = 20): Promise<WeakWord[]> {
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 86_400_000);

  const answers = await db.userAnswer.findMany({
    where: { userId, answeredAt: { gte: since } },
    select: {
      isCorrect: true,
      answeredAt: true,
      exercise: { select: { schemaJson: true } },
    },
    orderBy: { answeredAt: "desc" },
  });

  // Un ejercicio no apunta a su VocabularyEntry, así que la palabra se saca del
  // `schemaJson` (es lo que el alumno vio). Agrupamos por el término griego.
  const byTerm = new Map<string, { isCorrect: boolean; answeredAt: Date }[]>();
  for (const answer of answers) {
    const term = greekTermOf(answer.exercise.schemaJson);
    if (!term) continue;
    const list = byTerm.get(term) ?? [];
    list.push({ isCorrect: answer.isCorrect, answeredAt: answer.answeredAt });
    byTerm.set(term, list);
  }
  if (byTerm.size === 0) return [];

  const entries = await db.vocabularyEntry.findMany({
    where: { term: { in: [...byTerm.keys()] } },
  });

  return entries
    .map((entry) => {
      const history = byTerm.get(entry.term) ?? [];
      const mastery = computeMastery(history);
      return {
        term: entry.term,
        translation: entry.translation,
        transliteration: entry.transliteration,
        audioUrl: entry.audioUrl,
        mastery,
        difficulty: difficultyForMastery(mastery),
        attempts: history.length,
        failures: history.filter((h) => !h.isCorrect).length,
      };
    })
    .filter((w) => isWeak(w.mastery) && w.failures > 0)
    .sort((a, b) => a.mastery - b.mastery || b.failures - a.failures)
    .slice(0, limit);
}

/**
 * Fallos agrupados por tipo de error.
 *
 * "12 fallos por acento" es accionable; doce palabras sueltas, no
 * (EXERCISES.md §5).
 */
export async function getErrorGroups(userId: string): Promise<ErrorGroup[]> {
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 86_400_000);

  const failures = await db.userAnswer.findMany({
    where: { userId, isCorrect: false, answeredAt: { gte: since } },
    select: { errorTags: true, exercise: { select: { schemaJson: true } } },
    orderBy: { answeredAt: "desc" },
  });

  const groups = new Map<string, { count: number; examples: Set<string> }>();
  for (const failure of failures) {
    const term = greekTermOf(failure.exercise.schemaJson);
    for (const tag of failure.errorTags.split(",").filter(Boolean)) {
      if (!(ERROR_TAGS as readonly string[]).includes(tag)) continue;
      const group = groups.get(tag) ?? { count: 0, examples: new Set<string>() };
      group.count += 1;
      if (term && group.examples.size < 3) group.examples.add(term);
      groups.set(tag, group);
    }
  }

  return [...groups.entries()]
    .map(([tag, group]) => ({
      tag,
      label: TAG_LABEL[tag] ?? tag,
      count: group.count,
      examples: [...group.examples],
    }))
    .sort((a, b) => b.count - a.count);
}

/** Cuántas tarjetas tocan hoy según SM-2. */
export async function getDueCount(userId: string): Promise<number> {
  return db.reviewQueue.count({
    where: { userId, dueDate: { lte: new Date() } },
  });
}

// El término griego que el alumno vio, sea cual sea el tipo de ejercicio.
function greekTermOf(schemaJson: unknown): string | null {
  if (typeof schemaJson !== "object" || schemaJson === null) return null;
  const schema = schemaJson as Record<string, unknown>;

  if (typeof schema.answer === "string" && /\p{Script=Greek}/u.test(schema.answer)) {
    return schema.answer;
  }
  const prompt = schema.prompt as { text?: unknown } | undefined;
  if (typeof prompt?.text === "string" && /\p{Script=Greek}/u.test(prompt.text)) {
    return prompt.text;
  }
  if (typeof schema.letter === "string") return schema.letter;
  return null;
}
