"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/shared/lib/db";
import { getCurrentUser } from "./queries";
import { hashPassword, verifyPassword } from "./lib/password";
import { clearSessionCookie, setSessionCookie } from "./lib/session";

// Server Actions de auth (mutaciones). Validación siempre en el servidor (§6
// de ARCHITECTURE / regla 3 de AGENTS.md). Fallback mínimo: si la cuenta aún
// no existe, el primer inicio de sesión la crea (app personal de un usuario) —
// reemplazable por Auth.js sin tocar el modelo (ARCHITECTURE.md §1).

export type AuthState = { error?: string };

const emailSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

// ─────────────────────────────────────────────────────────────────────────────
// TEMP — PERFIL FALSO / LOGIN DE PRUEBAS. NO HAY FASE DE REGISTRO Y ESTO SE
// QUITA DESPUÉS. Credenciales: user / 1234. Salta la verificación de contraseña.
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_LOGIN = "user";
const DEMO_EMAIL = "user@demo.app";

async function ensureProfile(userId: string): Promise<void> {
  const exists = await db.profile.findUnique({ where: { userId } });
  if (exists) return;
  const [es, el] = await Promise.all([
    db.language.findUnique({ where: { code: "es" } }),
    db.language.findUnique({ where: { code: "el" } }),
  ]);
  if (!es || !el) throw new Error("Faltan los idiomas (corre el seed).");
  await db.profile.create({
    data: {
      userId,
      nativeLanguageId: es.id,
      targetLanguageId: el.id,
      dailyGoalMinutes: 15,
    },
  });
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const identifier = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // TEMP: acceso directo del perfil falso (sin verificar contraseña).
  if (identifier.toLowerCase() === DEMO_LOGIN) {
    const user = await db.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: {
        email: DEMO_EMAIL,
        passwordHash: hashPassword(password || "1234"),
      },
    });
    await ensureProfile(user.id);
    await setSessionCookie(user.id);
    redirect("/today");
  }

  const parsed = emailSchema.safeParse({ email: identifier, password });
  if (!parsed.success) return { error: "Correo o contraseña inválidos." };
  const { email } = parsed.data;

  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: { email, passwordHash: hashPassword(password) },
    });
  } else if (!verifyPassword(password, user.passwordHash)) {
    return { error: "Contraseña incorrecta." };
  }

  await setSessionCookie(user.id);
  redirect("/today");
}

export async function signOut(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

export type OnboardingState = { error?: string };

const goalSchema = z.coerce.number().int().min(5).max(120);

export async function saveOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const goal = goalSchema.safeParse(formData.get("dailyGoal"));
  if (!goal.success) {
    return { error: "La meta diaria debe estar entre 5 y 120 minutos." };
  }

  const [es, el] = await Promise.all([
    db.language.findUnique({ where: { code: "es" } }),
    db.language.findUnique({ where: { code: "el" } }),
  ]);
  if (!es || !el) return { error: "Falta el par de idiomas (corre el seed)." };

  await db.profile.upsert({
    where: { userId: user.id },
    update: { dailyGoalMinutes: goal.data },
    create: {
      userId: user.id,
      nativeLanguageId: es.id,
      targetLanguageId: el.id,
      dailyGoalMinutes: goal.data,
    },
  });

  redirect("/today");
}
