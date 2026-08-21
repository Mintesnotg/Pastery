import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "node:path";

const backendRoot = process.cwd();
const repoRoot = path.resolve(backendRoot, "");

for (const candidate of [
  //path.join(backendRoot, ".env"),
  path.join(backendRoot, ".env.local"),
 // path.join(repoRoot, ".env"),
  path.join(repoRoot, ".env.local"),
]) {
  dotenv.config({ path: candidate });
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dbCredentials: {

    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres%402026%23@127.0.0.1:5432/house_of_bread_prod",
  },
});
