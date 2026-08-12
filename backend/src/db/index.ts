import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.js";

const globalForDb = globalThis as typeof globalThis & {
  __houseOfBreadPool?: Pool;
};

export const pool =
  globalForDb.__houseOfBreadPool ??
  new Pool({
    connectionString: env.databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__houseOfBreadPool = pool;
}

export const db = drizzle(pool);
