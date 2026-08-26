import crypto from "node:crypto";

// Token de sesión firmado (HMAC-SHA256 con SESSION_SECRET). Módulo puro: no
// depende de Next, así puede usarse también desde scripts de test/verificación.

const SESSION_DAYS = 30;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET no está definida o es demasiado corta. Genera una con: openssl rand -base64 32",
    );
  }
  return secret;
}

function encode(data: unknown): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function createSessionToken(userId: string): string {
  const payload = encode({
    sub: userId,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, sign(payload))) return null;

  let data: { sub?: unknown; exp?: unknown };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof data.sub !== "string") return null;
  if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
  return data.sub;
}
