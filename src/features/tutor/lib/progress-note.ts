// Hechos contables del alumno — los genera el CÓDIGO, nunca la IA.
//
// Por qué (ARCHITECTURE.md §6.2, changelog 2026-08-27): si DeepSeek escribiera
// "es la 3ª vez esta semana" y eso se cachea por hash(ejercicio, respuesta),
// dentro de un mes la caché devolvería la misma frase y sería FALSA. El
// profesor estaría afirmando un dato que no puede verificar.
//
// Aquí se calcula fresco en cada render, a partir de los errorTags reales.
// En el mockup AnforaFeedback esto es un bloque aparte, con su icono de reloj,
// separado de la explicación del profesor. Esa separación es intencional.

/** Cómo se nombra cada errorTag en una frase en español. */
const TAG_LABEL: Record<string, string> = {
  acento_faltante: "omites el acento",
  sigma_final: "olvidas la ς final",
  confusion_i: "confundes η/ι/υ",
  confusion_omicron_omega: "confundes ο con ω",
  genero_incorrecto: "fallas el género",
  genero_neutro: "fallas el neutro",
  typo_aprox: "se te cuela un teclazo",
  confusion_b_v: "lees la β como /b/",
};

export interface ProgressNote {
  /** Frase lista para mostrar, o null si no hay nada que decir todavía. */
  text: string | null;
  /** El tag que la motivó, para el ícono/color. */
  tag?: string;
}

function ordinal(n: number): string {
  return n === 1 ? "1ª" : n === 2 ? "2ª" : `${n}ª`;
}

/**
 * @param tagsNow      errorTags del turno actual
 * @param countsInWeek veces que cada tag apareció en los últimos 7 días,
 *                     INCLUYENDO el de ahora
 */
export function buildProgressNote(
  tagsNow: string[],
  countsInWeek: Record<string, number>,
): ProgressNote {
  if (tagsNow.length === 0) return { text: null };

  // El tag más repetido de los que acaban de fallar: es el que más importa.
  const tag = [...tagsNow].sort(
    (a, b) => (countsInWeek[b] ?? 0) - (countsInWeek[a] ?? 0),
  )[0];
  const count = countsInWeek[tag] ?? 1;
  const label = TAG_LABEL[tag];

  // Sin etiqueta conocida no se inventa una frase: mejor callar que decir algo
  // genérico que suene a relleno.
  if (!label) return { text: null };

  // A la primera no se dice nada: señalar "es la 1ª vez" no aporta y suena a
  // reproche. La nota aparece cuando ya hay un patrón.
  if (count < 2) return { text: null };

  return {
    text: `Es la ${ordinal(count)} vez esta semana que ${label}. Lo agregué a tu repaso.`,
    tag,
  };
}
