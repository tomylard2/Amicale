import { PrismaClient } from "@prisma/client";

// Client Prisma en singleton.
// En développement, Next.js recharge le code à chaud (hot reload) : sans ce
// singleton, on créerait une nouvelle connexion à chaque rechargement et on
// épuiserait rapidement le nombre de connexions à la base.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
