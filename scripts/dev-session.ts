// Utilidad de desarrollo: crea (si hace falta) un usuario de prueba con su
// perfil y escupe una cookie de sesión válida, para poder verificar rutas
// protegidas con curl sin pasar por el formulario.
//
//   npx tsx scripts/dev-session.ts
import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/features/auth/lib/password";
import { createSessionToken } from "../src/features/auth/lib/token";

const db = new PrismaClient();

async function main() {
  const EMAIL = "test@local";

  const user =
    (await db.user.findUnique({ where: { email: EMAIL } })) ??
    (await db.user.create({
      data: { email: EMAIL, passwordHash: await hashPassword("1234") },
    }));

  const [es, el] = await Promise.all([
    db.language.findUnique({ where: { code: "es" } }),
    db.language.findUnique({ where: { code: "el" } }),
  ]);
  if (!es || !el) throw new Error("Faltan los idiomas: corre `npm run db:seed` antes.");

  await db.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      nativeLanguageId: es.id,
      targetLanguageId: el.id,
      dailyGoalMinutes: 15,
    },
  });

  console.log(createSessionToken(user.id));
  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
