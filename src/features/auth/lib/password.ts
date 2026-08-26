import crypto from "node:crypto";

// Hash de contraseñas con scrypt (Node nativo, sin dependencias extra).
// Formato: "<salt hex>:<hash hex>". El hash usa 64 bytes y un salt de 16.

const KEYLEN = 64;
const SALTLEN = 16;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALTLEN).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, KEYLEN).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(candidate, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
