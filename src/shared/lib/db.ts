import { PrismaClient } from "@prisma/client";

// Singleton del cliente Prisma (ARCHITECTURE.md §3.1: shared/lib/db.ts).
// Evita abrir una conexión nueva en cada hot-reload de Next.js en dev.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
