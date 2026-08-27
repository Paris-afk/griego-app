// Rutas de los audios de vocabulario pre-generados (Fase 3.5 / §3 paso 3).
// El audio es CONTENIDO estático: se genera una vez con `npm run audio:generate`
// y se sirve desde /audio/el/. La ruta deriva de un hash del texto griego, así
// el generador (Node) y la UI (cliente) producen la misma URL sin guardarla
// en la BD. Idempotente: texto sin cambios → mismo archivo (se salta al regenerar).

// FNV-1a de 32 bits — rápido y determinista. Suficiente para ~236 nombres de
// archivo (no es criptográfico, solo para nombrar).
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function audioHash(text: string): string {
  return fnv1a(text).toString(16).padStart(8, "0");
}

export function audioPathForText(text: string): string {
  return `/audio/el/${audioHash(text)}.mp3`;
}

// Para el seed (VocabularyEntry.audioUrl) — ruta absoluta servible.
export const AUDIO_LANGUAGE_DIR = "/audio/el";
