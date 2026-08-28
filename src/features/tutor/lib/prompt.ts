// Composición del prompt del profesor (ARCHITECTURE.md §6.2).
// Puro y sin dependencias: se puede testear sin llamar a la API.

export interface LearnerContext {
  level: string;
  moduleTitle?: string;
  masteredCount: number;
  streak: number;
  /** [{tag, count}] de errorTags acumulados. */
  recurringErrors: { tag: string; count: number }[];
  weakLetters: string[];
}

export interface TutorTurn {
  /** Enunciado tal y como lo vio el alumno. */
  instruction: string;
  expected: string;
  userAnswer: string;
  /** Etiquetas que YA detectó el validador determinista. La IA no las decide. */
  errorTags: string[];
  /** `bridgeLanguage` de las ContrastiveNote que casan con esos errorTags. */
  bridges: string[];
}

// El "personaje". Incluye la palabra `json` y un ejemplo del formato porque la
// documentación de DeepSeek lo exige: sin eso, con `response_format:
// json_object` el modelo puede devolver solo espacios en blanco.
export const SYSTEM_PROMPT = `Eres un profesor de griego moderno para hispanohablantes.

Reglas de tu respuesta:
- Escribe SIEMPRE en español. El griego solo aparece como ejemplo.
- Señala el error concreto ANTES de dar la corrección.
- Explica en 2 o 3 frases. No des clases magistrales ni sermones.
- Tono cálido y directo. Nada de "¡No te preocupes!" ni condescendencia.
- Si el alumno tiene un error recurrente relacionado, conéctalo.
- NUNCA afirmes datos que no te hayan dado: no inventes cuántas veces ha
  fallado, ni su racha, ni cuánto lleva estudiando. De eso se encarga la app.

Responde SOLO con un objeto json con esta forma exacta:
{"errors":[{"user":"lo que escribió","correct":"lo correcto","why":"el motivo en 1 frase"}],"explanation":"2-3 frases","encouragement":"1 frase","tip":"consejo breve o cadena vacía"}`;

// El LearnerSnapshot compacto (~80 tokens). Da TONO y ÉNFASIS, no datos que la
// IA pueda repetir como hechos — por eso los conteos van aquí solo para que
// sepa en qué insistir, y la regla del system prompt le prohíbe citarlos.
export function renderLearnerContext(ctx: LearnerContext): string {
  const lines = [`Nivel: ${ctx.level}${ctx.moduleTitle ? ` · Módulo: ${ctx.moduleTitle}` : ""}`];
  lines.push(`Palabras dominadas: ${ctx.masteredCount} · Racha: ${ctx.streak} días`);
  if (ctx.recurringErrors.length > 0) {
    const top = ctx.recurringErrors
      .slice(0, 3)
      .map((e) => `${e.tag} (${e.count})`)
      .join(", ");
    lines.push(`Errores recurrentes: ${top}`);
  }
  if (ctx.weakLetters.length > 0) {
    lines.push(`Letras débiles: ${ctx.weakLetters.join(", ")}`);
  }
  return lines.join("\n");
}

export function renderTurn(turn: TutorTurn): string {
  const lines = [
    `Ejercicio: ${turn.instruction}`,
    `Respuesta esperada: ${turn.expected}`,
    `El alumno escribió: ${turn.userAnswer || "(nada)"}`,
  ];
  if (turn.errorTags.length > 0) {
    lines.push(`Errores ya detectados por el corrector: ${turn.errorTags.join(", ")}`);
  }
  if (turn.bridges.length > 0) {
    // El puente contrastivo: lo que convierte la explicación en la de un
    // profesor que sabe de dónde viene el alumno (CURRICULUM.md §4).
    lines.push(`Apóyate en esto, que el alumno ya sabe del español:`);
    for (const bridge of turn.bridges) lines.push(`- ${bridge}`);
  }
  return lines.join("\n");
}

export function buildMessages(ctx: LearnerContext, turn: TutorTurn) {
  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Contexto del alumno:\n${renderLearnerContext(ctx)}\n\n${renderTurn(turn)}`,
    },
  ];
}
