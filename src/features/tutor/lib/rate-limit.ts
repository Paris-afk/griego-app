// Rate limiting de las llamadas a DeepSeek (ARCHITECTURE.md §8).
//
// No es para defenderse de un atacante: es una app personal. Es para que un
// bucle accidental —un useEffect mal puesto, un reintento en cascada— no se
// coma el crédito en un rato. Ventana deslizante en memoria: suficiente para un
// proceso único y sin dependencias.

const WINDOW_MS = 60_000;
const MAX_CALLS_PER_WINDOW = 20;

const calls = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  /** Segundos hasta que se libere un hueco (solo si `allowed` es false). */
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  now: number = Date.now(),
): RateLimitResult {
  const recent = (calls.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_CALLS_PER_WINDOW) {
    calls.set(key, recent);
    const oldest = recent[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }

  recent.push(now);
  calls.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Solo para tests: vacía el estado entre casos. */
export function resetRateLimit(): void {
  calls.clear();
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX_CALLS_PER_WINDOW } as const;
