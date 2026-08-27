// Normalización NFD para comparar respuestas de griego (ARCHITECTURE.md §5.3).
// minúsculas → NFD (separa diacríticos) → eliminar diacríticos → trim → comparar.
//
// Importante (§5.3): quitar diacríticos hace que «δεντρο» se acepte como
// «δέντρο», pero el ejercicio debe SEÑALAR que faltó el acento — se devuelve el
// errorTag `acento_faltante` (correcto-con-observación), no como fallo.

const DIACRITICS = /[\u0300-\u036f]/g;

export function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(DIACRITICS, "");
}

// Comparación para validar respuestas: ambos lados pierden acentos y mayúsculas.
export function normalizeForComparison(input: string): string {
  return stripDiacritics(input).trim().toLowerCase();
}

export function countDiacritics(input: string): number {
  // NFD primero: descompone acentos griegos precompuestos (ej. ί) en la letra +
  // marca combinante, para poder contarlos aunque el input venga sin acentos.
  return (input.normalize("NFD").match(DIACRITICS) ?? []).length;
}

// Distancia de Levenshtein (ediciones de un carácter) para detectar teclazos.
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(
        dp[i] + 1,
        dp[i - 1] + 1,
        prev + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[m];
}

export interface TextComparisonResult {
  isCorrect: boolean;
  errorTags: string[];
}

// Compara una respuesta escrita contra la canónica y sus aceptadas (accept[]).
export function compareText(
  answer: string,
  accept: string[],
  input: string,
): TextComparisonResult {
  const inputNorm = normalizeForComparison(input);
  const targets = [answer, ...accept].map(normalizeForComparison);

  // 1) Coincide ignorando acentos (o con una variante aceptada).
  if (targets.includes(inputNorm)) {
    const errorTags: string[] = [];
    if (
      normalizeForComparison(answer) === inputNorm &&
      countDiacritics(answer) > countDiacritics(input)
    ) {
      errorTags.push("acento_faltante");
    }
    return { isCorrect: true, errorTags };
  }

  const answerTrimmed = normalizeForComparison(answer);
  const inputTrimmed = inputNorm;

  // 2) σ ↔ ς final (regla ortográfica: ς solo al final). Correcto-observación.
  if (
    answerTrimmed.endsWith("ς") &&
    inputTrimmed.endsWith("σ") &&
    answerTrimmed.slice(0, -1) === inputTrimmed.slice(0, -1)
  ) {
    return { isCorrect: true, errorTags: ["sigma_final"] };
  }

  // 3) Teclazo (distancia de edición con umbral por longitud).
  const tolerance =
    answerTrimmed.length <= 3 ? 0 : answerTrimmed.length <= 6 ? 1 : 2;
  const dist = levenshtein(inputTrimmed, answerTrimmed);
  if (dist > 0 && dist <= tolerance) {
    return { isCorrect: false, errorTags: ["typo_aprox"] };
  }

  return { isCorrect: false, errorTags: [] };
}
