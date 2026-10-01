import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __houseOfBreadPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__houseOfBreadPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__houseOfBreadPrisma = prisma;
}

export type DbClient = PrismaClient | Prisma.TransactionClient;
