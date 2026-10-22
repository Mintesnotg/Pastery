import { Prisma, PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "../shared/lib/logger.js";

/**
 * Shared hosting gives us a small MySQL connection budget. Apply conservative
 * pool/timeout settings unless the DATABASE_URL already specifies them.
 */
function withPoolSettings(url: string) {
  try {
    const parsed = new URL(url);
    const defaults: Record<string, string> = {
      connection_limit: String(env.dbPoolSize),
      pool_timeout: String(env.dbPoolTimeoutSeconds),
      connect_timeout: String(env.dbConnectTimeoutSeconds),
    };
    for (const [key, value] of Object.entries(defaults)) {
      if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const globalForPrisma = globalThis as typeof globalThis & {
  __houseOfBreadPrisma?: PrismaClient;
};

function createPrismaClient() {
  const client = new PrismaClient({
    datasourceUrl: withPoolSettings(env.databaseUrl),
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });
  client.$on("error", (event) => logger.error({ target: event.target, message: event.message }, "prisma error"));
  client.$on("warn", (event) => logger.warn({ target: event.target, message: event.message }, "prisma warning"));
  return client;
}

export const prisma = globalForPrisma.__houseOfBreadPrisma ?? createPrismaClient();

if (!env.isProduction) {
  globalForPrisma.__houseOfBreadPrisma = prisma;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Warm up the connection pool with bounded retries. Prisma also connects lazily
 * on first query, so a failure here is logged but never fatal.
 */
export async function connectDatabaseWithRetry(maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$connect();
      logger.info("database connected");
      return true;
    } catch (err) {
      logger.error({ err, attempt, maxAttempts }, "database connection failed");
      if (attempt < maxAttempts) await sleep(Math.min(1000 * 2 ** (attempt - 1), 10_000));
    }
  }
  logger.error("database unavailable after retries; requests will fail until it recovers");
  return false;
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
  } catch (err) {
    logger.warn({ err }, "error while disconnecting database");
  }
}

export type DbClient = PrismaClient | Prisma.TransactionClient;
