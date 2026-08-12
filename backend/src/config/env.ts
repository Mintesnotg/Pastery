import dotenv from "dotenv";
import path from "node:path";

const cwd = process.cwd();
const backendRoot = cwd.endsWith(`${path.sep}backend`) ? cwd : path.resolve(cwd, "backend");
const repoRoot = path.resolve(backendRoot, "..");

for (const candidate of [
  path.join(backendRoot, ".env"),
  path.join(backendRoot, ".env.local"),
  path.join(repoRoot, ".env"),
  path.join(repoRoot, ".env.local"),
]) {
  dotenv.config({ path: candidate });
}

const required = (name: string, fallback?: string) => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@houseofbread.local",
  bootstrapPassword: required("ADMIN_BOOTSTRAP_PASSWORD", "change-me-now"),
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 7),
};
