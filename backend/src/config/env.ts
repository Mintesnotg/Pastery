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

/** GoDaddy PaaS injects DB_*; local/dev uses DATABASE_URL. */
export function resolveDatabaseUrl(): string {
  const host = process.env.DB_HOST;
  if (host) {
    const user = encodeURIComponent(process.env.DB_USER ?? "");
    const pass = encodeURIComponent(process.env.DB_PASSWORD ?? "");
    const port = process.env.DB_PORT ?? "3306";
    const name = process.env.DB_NAME ?? "";
    const auth = pass ? `${user}:${pass}` : user;
    return `mysql://${auth}@${host}:${port}/${name}`;
  }
  return required("DATABASE_URL");
}

const databaseUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = databaseUrl;

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@houseofbread.local",
  bootstrapPassword: required("ADMIN_BOOTSTRAP_PASSWORD", "change-me-now"),
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 7),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  mailFrom: process.env.MAIL_FROM ?? "House of Bread <info@houseofbreadlondon.co.uk>",
  frontendUrl: process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:3000",
  /** `godaddy` | `smtp` | `auto` (godaddy when NODE_ENV=production or DB_HOST set) */
  emailTransport: (process.env.EMAIL_TRANSPORT ?? "auto").toLowerCase(),
};
