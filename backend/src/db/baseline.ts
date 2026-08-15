import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { env } from "../config/env.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(currentDir, "..", "..", "migrations");
const journalPath = path.join(migrationsDir, "meta", "_journal.json");

type Journal = {
  entries: Array<{
    tag: string;
    when: number;
  }>;
};

async function ensureDrizzleMigrationsTable(client: import("pg").PoolClient) {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS "drizzle"
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint NOT NULL
    )
  `);
}

async function run() {
  const pool = new Pool({ connectionString: env.databaseUrl });
  try {
    const client = await pool.connect();
    try {
      await ensureDrizzleMigrationsTable(client);

      const journal = JSON.parse(await fs.readFile(journalPath, "utf8")) as Journal;
      const baseline = journal.entries[0];
      if (!baseline) {
        throw new Error("No migration journal entries found");
      }

      const existing = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "drizzle"."__drizzle_migrations" WHERE created_at = $1`,
        [baseline.when]
      );

      if (Number(existing.rows[0]?.count ?? 0) > 0) {
        console.log(`Drizzle baseline already recorded for ${baseline.tag}`);
        return;
      }

      const hash = crypto.createHash("sha256").update(baseline.tag).digest("hex");
      await client.query(
        `INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, baseline.when]
      );
      console.log(`Recorded Drizzle baseline as applied: ${baseline.tag}`);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Drizzle baseline failed:", err);
  process.exit(1);
});
