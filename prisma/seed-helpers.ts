import type { Exercise } from "../src/features/exercises/schemas";

// Helpers puros de la generación de contenido (sin Prisma ni React), para poder
// testearlos con Vitest.

// Partir `total` entradas en lecciones cortas, evitando una última minúscula.
// Devuelve los tamaños (suman `total`). Permite lecciones de 3 en el caso
// límite (ej. 7 entradas → [4,3]) — una corta se juega mejor que una larguísima.
export function chunkSizes(total: number, min = 3, max = 6): number[] {
  if (total <= max) return [total];
  const k = Math.ceil(total / max);
  const base = Math.floor(total / k);
  const remainder = total % k;
  const sizes = Array(k).fill(base);
  for (let i = 0; i < remainder; i++) sizes[i]++;
  for (let i = sizes.length - 1; i >= 0 && sizes[i] < min && i > 0; i--) {
    sizes[i - 1] += sizes[i];
    sizes.splice(i, 1);
  }
  return sizes;
}

// RNG determinista (mulberry32) para que el intercalado sea reproducible.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface LessonExercise {
  word: string;
  /** Debe coincidir con el enum ExerciseType de Prisma. */
  type:
    | "MULTIPLE_CHOICE"
    | "TRANSLATION"
    | "ORDER_WORDS"
    | "FILL_BLANK"
    | "ALPHABET_DRILL"
    | "CONCEPT"
    | "MATCH_PAIRS"
    | "GENDER_SORT"
    | "LISTEN_CHOOSE"
    | "AUTOCOMPLETE"
    | "CASE_PAIRS"
    | "MEMORY_GRID"
    | "SPEED_ROUND";
  schemaJson: Exercise;
}

// Intercala de forma determinista maximizando variedad: evita la misma palabra
// en dos ejercicios seguidos y que un TIPO aparezca más de 2 veces seguidas.
// Algoritmo voraz con puntuación (baraja primero por semilla para variar).
export function interleaveLessonExercises(
  items: LessonExercise[],
  seedKey: string,
): LessonExercise[] {
  const arr = seededShuffle([...items], seedKey);
  const out: LessonExercise[] = [];
  while (arr.length > 0) {
    const last = out[out.length - 1];
    const prevType = last?.type ?? null;
    const prevPrevType = out[out.length - 2]?.type ?? null;
    const lastWord = last?.word ?? null;

    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const x = arr[i];
      let score = 0;
      if (lastWord !== null && x.word !== lastWord) score += 4;
      const threeSame = x.type === prevType && x.type === prevPrevType;
      if (!threeSame) score += 4;
      if (prevType !== null && x.type !== prevType) score += 2;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    out.push(arr.splice(bestIdx, 1)[0]);
  }
  return out;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const rng = mulberry32(hashString(seed));
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
