import { resolve, join } from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

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
const db = drizzle(pool);

await migrate(db, { migrationsFolder: resolve(backendRoot, "migrations") });
console.log("Migrations applied successfully.");

await pool.end();
