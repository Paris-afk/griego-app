import "server-only";

import { computeMastery } from "@/shared/lib/mastery";
import { db } from "@/shared/lib/db";

// Vocabulario por grupos temáticos — una vía PARALELA al curso.
//
// El curso estructurado tiene su propio orden y ritmo, y eso es bueno: sabes
// qué regla estás practicando. Pero a veces quieres solo repasar los meses, o
// la familia, sin pasar por la lección que toca. Esta sección es para eso.
//
// Comparte el vocabulario y el dominio con el curso: no es contenido aparte,
// es OTRA PUERTA al mismo contenido. Así lo que practiques aquí cuenta allí.

export interface VocabGroup {
  key: string;
  label: string;
  emoji: string;
  total: number;
  /** Cuántas se dominan (4-5 de 5). */
  mastered: number;
}

export interface VocabCard {
  term: string;
  article: string | null;
  translation: string;
  transliteration: string | null;
  emoji: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  note: string | null;
  mastery: number;
}

// Nombre y emoji de cada `categoria` del contenido. Lo que no esté aquí se
// muestra con su clave en crudo — visible, para que se note que falta.
const GROUP_META: Record<string, { label: string; emoji: string }> = {
  saludo: { label: "Saludos", emoji: "👋" },
  cortesia: { label: "Cortesía", emoji: "🙏" },
  identidad: { label: "Presentarse", emoji: "🪪" },
  numero: { label: "Números", emoji: "🔢" },
  familia: { label: "Familia", emoji: "👨‍👩‍👧‍👦" },
  comida: { label: "Comida y bebida", emoji: "🍽️" },
  rutina: { label: "Rutina diaria", emoji: "⏰" },
  compras: { label: "Compras", emoji: "🛍️" },
  dia: { label: "Días de la semana", emoji: "📅" },
  mes: { label: "Meses del año", emoji: "📆" },
  fecha: { label: "Fechas", emoji: "🗓️" },
  viaje: { label: "Viajes", emoji: "🧳" },
  plan: { label: "Planes", emoji: "💭" },
  tiempo: { label: "Ayer, hoy y mañana", emoji: "⏳" },
  aoristo: { label: "Pasado (aóristo)", emoji: "⏪" },
  "verbo-a": { label: "Verbos tipo A", emoji: "🅰️" },
  "verbo-b1": { label: "Verbos tipo B1", emoji: "🅱️" },
};

const WINDOW_DAYS = 30;

export async function getVocabGroups(userId: string): Promise<VocabGroup[]> {
  const [entries, mastery] = await Promise.all([
    db.vocabularyEntry.findMany({ select: { tags: true, term: true } }),
    masteryByTerm(userId),
  ]);

  const groups = new Map<string, { total: number; mastered: number }>();
  for (const entry of entries) {
    const key = entry.tags || "otros";
    const group = groups.get(key) ?? { total: 0, mastered: 0 };
    group.total += 1;
    if ((mastery.get(entry.term) ?? 0) >= 4) group.mastered += 1;
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([key, group]) => ({
      key,
      label: GROUP_META[key]?.label ?? key,
      emoji: GROUP_META[key]?.emoji ?? "📚",
      total: group.total,
      mastered: group.mastered,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getVocabCards(
  userId: string,
  groupKey: string,
): Promise<VocabCard[]> {
  const [entries, mastery] = await Promise.all([
    db.vocabularyEntry.findMany({ where: { tags: groupKey } }),
    masteryByTerm(userId),
  ]);

  return entries.map((entry) => ({
    term: entry.term,
    article: null,
    translation: entry.translation,
    transliteration: entry.transliteration,
    emoji: entry.emoji,
    imageUrl: entry.imageUrl,
    audioUrl: entry.audioUrl,
    note: null,
    mastery: mastery.get(entry.term) ?? 0,
  }));
}

export function groupLabel(key: string): string {
  return GROUP_META[key]?.label ?? key;
}

// Dominio por término, con el MISMO cálculo que el curso y el repaso: si se
// derivara distinto aquí, las tres pantallas se contradirían.
async function masteryByTerm(userId: string): Promise<Map<string, number>> {
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000);
  const answers = await db.userAnswer.findMany({
    where: { userId, answeredAt: { gte: since } },
    select: {
      isCorrect: true,
      answeredAt: true,
      exercise: { select: { schemaJson: true } },
    },
  });

  const byTerm = new Map<string, { isCorrect: boolean; answeredAt: Date }[]>();
  for (const answer of answers) {
    const term = greekTermOf(answer.exercise.schemaJson);
    if (!term) continue;
    const list = byTerm.get(term) ?? [];
    list.push({ isCorrect: answer.isCorrect, answeredAt: answer.answeredAt });
    byTerm.set(term, list);
  }

  const out = new Map<string, number>();
  for (const [term, history] of byTerm) out.set(term, computeMastery(history));
  return out;
}

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
