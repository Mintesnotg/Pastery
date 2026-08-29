import { resolve, join } from "node:path";
import { readFileSync } from "node:fs";
import dotenv from "dotenv";
import { Pool } from "pg";

const cwd = process.cwd();
const backendRoot = cwd.endsWith("backend") ? cwd : resolve(cwd, "backend");
const repoRoot = resolve(backendRoot, "..");

for (const candidate of [
  join(backendRoot, ".env.local"),
  join(backendRoot, ".env"),
  join(repoRoot, ".env.local"),
  join(repoRoot, ".env"),
]) {
  dotenv.config({ path: candidate });
}

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres%402026%23@127.0.0.1:5432/house_of_bread_prod";

const pool = new Pool({ connectionString: DATABASE_URL });

async function baseline() {
  const journalPath = resolve(backendRoot, "migrations", "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf-8")) as {
    entries: Array<{ idx: number; when: number; tag: string }>;
  };

  if (journal.entries.length === 0) {
    console.log("No journal entries found. Nothing to baseline.");
    return;
  }

  // Find the most recent migration by timestamp
  const lastEntry = journal.entries.reduce((a, b) => (a.when > b.when ? a : b));

  const client = await pool.connect();
  try {
    // drizzle-orm's migrate() uses the 'drizzle' schema by default
    await client.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id         SERIAL PRIMARY KEY,
        hash       TEXT   NOT NULL,
        created_at BIGINT
      )
    `);

    const { rows } = await client.query(
      `SELECT created_at FROM "drizzle"."__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`
    );

    if (rows.length > 0 && Number(rows[0].created_at) >= lastEntry.when) {
      console.log(`Already baselined through: ${lastEntry.tag}`);
      return;
    }

    // Insert a sentinel row — drizzle-orm skips any migration whose 'when' <= this value
    await client.query(
      `INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
      [`baseline:${lastEntry.tag}`, lastEntry.when]
    );
    console.log(`Baselined through: ${lastEntry.tag} (${lastEntry.when})`);
    console.log("\nBaseline complete. Run 'npm run db:migrate' to apply future migrations.");
  } finally {
    client.release();
    await pool.end();
  }
}

baseline().catch((err) => {
  console.error("Baseline failed:", err.message);
  process.exit(1);
});
