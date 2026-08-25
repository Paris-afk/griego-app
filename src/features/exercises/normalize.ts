// Normalización NFD para comparar respuestas de griego (ARCHITECTURE.md §5.3).
// minúsculas → NFD (separa diacríticos) → eliminar diacríticos → trim → comparar.
// Así `δεντρο` se acepta como `δέντρο`, y las transliteraciones con acento
// (ej. "déntro") se comparan sin el acento.

export function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Comparación para validar respuestas: ambos lados pierden acentos y mayúsculas.
export function normalizeForComparison(input: string): string {
  return stripDiacritics(input).trim().toLowerCase();
}
