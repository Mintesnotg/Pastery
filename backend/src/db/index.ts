import { PrismaClient } from "@prisma/client";
import { createRequire } from "node:module";

const globalForPrisma = globalThis as typeof globalThis & {
  __houseOfBreadPrisma?: PrismaClient;
};

// #region agent log
const require = createRequire(import.meta.url);
let prismaPkgVersion = "unknown";
try {
  prismaPkgVersion = require("@prisma/client/package.json").version as string;
} catch {
  prismaPkgVersion = "unreadable";
}
fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
  body: JSON.stringify({
    sessionId: "f1fde4",
    runId: "pre-fix",
    hypothesisId: "A",
    location: "src/db/index.ts:init",
    message: "Prisma client init context",
    data: {
      prismaPkgVersion,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      nodeEnv: process.env.NODE_ENV ?? "undefined",
      constructorArgs: "legacy-no-adapter",
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export const prisma =
  globalForPrisma.__houseOfBreadPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__houseOfBreadPrisma = prisma;
}

export type DbClient = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
