import { TutorResponseSchema, type TutorResponse } from "../schemas";
import { buildMessages, type LearnerContext, type TutorTurn } from "./prompt";

// Puerto a DeepSeek (patrón 4 de ARCHITECTURE.md §3.2). Es el ÚNICO lugar del
// proyecto que conoce el formato de la API: si cambia el proveedor, se toca
// este archivo y nada más.

const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TIMEOUT_MS = 8000;
// Con margen: la doc de DeepSeek avisa de que un max_tokens corto trunca el
// JSON a la mitad y lo deja inparseable.
const MAX_TOKENS = 500;

export type TutorOutcome =
  | { status: "ok"; response: TutorResponse; fromCache: false }
  | { status: "unavailable"; reason: "no_api_key" | "timeout" | "http_error" | "invalid_json" };

interface DeepSeekChoice {
  message?: { content?: string };
}

async function callOnce(
  messages: ReturnType<typeof buildMessages>,
  apiKey: string,
  signal: AbortSignal,
): Promise<unknown> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      // Solo garantiza JSON válido, NO el schema: Zod sigue siendo obligatorio.
      response_format: { type: "json_object" },
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
    }),
    signal,
  });

  if (!res.ok) throw new Error(`http_${res.status}`);
  const data = (await res.json()) as { choices?: DeepSeekChoice[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty_content");
  return JSON.parse(content);
}

/**
 * Pide una explicación al profesor. NUNCA lanza: si algo falla, devuelve
 * `unavailable` y quien llama cae al feedback fijo del contenido. La app debe
 * funcionar entera sin IA (ARCHITECTURE.md §6.1).
 */
export async function askTutor(
  ctx: LearnerContext,
  turn: TutorTurn,
): Promise<TutorOutcome> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { status: "unavailable", reason: "no_api_key" };

  const messages = buildMessages(ctx, turn);

  // Un reintento y se acabó (§6.2). Reintentar más solo alarga la espera del
  // alumno para acabar cayendo igualmente al feedback fijo.
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const raw = await callOnce(messages, apiKey, controller.signal);
      const parsed = TutorResponseSchema.safeParse(raw);
      if (parsed.success) {
        return { status: "ok", response: parsed.data, fromCache: false };
      }
      // JSON válido pero con la forma equivocada: se reintenta una vez.
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.startsWith("http_")) {
        return { status: "unavailable", reason: "http_error" };
      }
      if (attempt === 1) {
        return {
          status: "unavailable",
          reason: controller.signal.aborted ? "timeout" : "invalid_json",
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return { status: "unavailable", reason: "invalid_json" };
}
