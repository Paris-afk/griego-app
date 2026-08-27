// Controlador de audio del reproductor (Fase 4.5). La restricción de autoplay
// es POR ELEMENTO: crear un <audio> nuevo por palabra lo vuelve a bloquear
// (MDN). Por eso usamos UN solo elemento persistente, desbloqueado con el gesto
// de "Comenzar", y le cambiamos el `src` por palabra. Otro elemento (desbloqueado
// en el mismo gesto) para los sonidos de acierto/error.
//
// Client-only: los `new Audio()` se crean de forma perezosa (funciones), nunca
// en el import, para no romper el SSR de Next.

// Un WAV de 50 ms en silencio (data-URI) para desbloquear el elemento en el
// primer gesto del usuario.
const SILENT_WAV =
  "data:audio/wav;base64," +
  "UklGRv////9XQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAATElTVBoAAABJTkZPSVNGVA0AAAB" +
  "MYXZmNjEuNy4xMDAAAGRhdGH/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

let wordEl: HTMLAudioElement | undefined;
let sfxEl: HTMLAudioElement | undefined;
let unlocked = false;

function isDom(): boolean {
  return typeof window !== "undefined";
}

function getWord(): HTMLAudioElement | null {
  if (!isDom()) return null;
  if (!wordEl) wordEl = new Audio();
  return wordEl;
}

function getSfx(): HTMLAudioElement | null {
  if (!isDom()) return null;
  if (!sfxEl) sfxEl = new Audio();
  return sfxEl;
}

// Llámala dentro de un gesto del usuario (el botón "Comenzar" de la lección).
// Desbloquea los dos elementos para que el autoplay posterior funcione.
export function unlockAudio(): void {
  if (!isDom() || unlocked) return;
  const el = getSfx();
  if (el) {
    el.src = SILENT_WAV;
    void el.play().catch(() => {});
    unlocked = true;
  }
}

// Reproduce el audio de una palabra (src = ruta estática /audio/el/<hash>.mp3).
export function playWord(url: string | undefined): void {
  if (!url || !isDom()) return;
  const el = getWord();
  if (!el) return;
  el.src = url;
  void el.play().catch(() => {});
}

export type Sfx = "correct" | "wrong";

export function playSfx(kind: Sfx): void {
  if (!isDom()) return;
  const el = getSfx();
  if (!el) return;
  el.src = kind === "correct" ? "/sfx/correct.mp3" : "/sfx/wrong.mp3";
  void el.play().catch(() => {});
}
