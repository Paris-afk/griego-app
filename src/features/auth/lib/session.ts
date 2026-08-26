import { cookies } from "next/headers";

import { createSessionToken, verifySessionToken } from "./token";

// Lectura/escritura de la cookie de sesión (server-only, usa next/headers).
// El token en sí vive en `./token.ts` (módulo puro, testeable).

const COOKIE_NAME = "griego_session";
const SESSION_DAYS = 30;

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getUserIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}
