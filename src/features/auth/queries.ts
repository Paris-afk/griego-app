import { db } from "@/shared/lib/db";
import { getUserIdFromCookies } from "./lib/session";

// Lecturas de sesión/usuario. Devuelve el usuario autenticado (con su perfil)
// o null si no hay sesión válida.

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function getCurrentUser() {
  const userId = await getUserIdFromCookies();
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}
