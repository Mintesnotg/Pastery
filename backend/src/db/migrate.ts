import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, type PoolClient } from "pg";
import { env } from "../config/env.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(currentDir, "..", "..", "migrations");

type MigrationFile = {
  name: string;
  path: string;
  order: string;
};

async function ensureMigrationTable(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS __migration_history (
      id text PRIMARY KEY,
      filename text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    ALTER TABLE __migration_history
    ADD COLUMN IF NOT EXISTS filename text NOT NULL DEFAULT ''
  `);
  await client.query(`
    ALTER TABLE __migration_history
    ADD COLUMN IF NOT EXISTS applied_at timestamptz NOT NULL DEFAULT now()
  `);
}

async function hasExistingBaseSchema(client: PoolClient) {
  const result = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'products'
      ) AS exists
    `
  );
  return result.rows[0]?.exists ?? false;
}

function getMigrationOrder(filename: string) {
  const match = filename.match(/^(\d+)_/);
  return match ? match[1] : filename;
}

async function run() {
  const pool = new Pool({ connectionString: env.databaseUrl });

  try {
    const client = await pool.connect();
    try {
      const files = (await fs.readdir(migrationsDir))
        .filter((file) => file.endsWith(".sql"))
        .map((file) => ({
          name: file,
          path: path.join(migrationsDir, file),
          order: getMigrationOrder(file),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      await ensureMigrationTable(client);

      const history = await client.query<{ id: string }>(
        "SELECT id FROM __migration_history ORDER BY applied_at ASC, id ASC"
      );
      const applied = new Set(history.rows.map((row) => row.id));
      const baseSchemaExists = await hasExistingBaseSchema(client);

      let appliedCount = 0;

      await client.query("BEGIN");
      for (const file of files) {
        if (applied.has(file.name)) continue;
        if (file === files[0] && baseSchemaExists) {
          await client.query(
            `INSERT INTO __migration_history (id, filename)
             VALUES ($1, $2)
             ON CONFLICT (id) DO NOTHING`,
            [file.name, file.name]
          );
          applied.add(file.name);
          console.log(`Recorded existing base schema as applied: ${file.name}`);
          continue;
        }
        const sql = await fs.readFile(file.path, "utf8");
        await client.query(sql);
        await client.query(
          `INSERT INTO __migration_history (id, filename)
           VALUES ($1, $2)
           ON CONFLICT (id) DO NOTHING`,
          [file.name, file.name]
        );
        appliedCount += 1;
        console.log(`Applied migration: ${file.name}`);
      }
      await client.query("COMMIT");
      if (appliedCount === 0) {
        console.log("No pending migrations found.");
      }
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
