import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

// Load .env files for local development only. Values already present in
// process.env (e.g. set in the hosting dashboard) are never overridden.
const cwd = process.cwd();
const backendRoot = cwd.endsWith(`${path.sep}backend`) ? cwd : path.resolve(cwd, "backend");
const repoRoot = path.resolve(backendRoot, "..");

for (const candidate of [
  path.join(backendRoot, ".env"),
  path.join(backendRoot, ".env.local"),
  path.join(repoRoot, ".env"),
  path.join(repoRoot, ".env.local"),
]) {
  dotenv.config({ path: candidate, quiet: true });
}

const nodeEnv = process.env.NODE_ENV === "production" ? "production" : process.env.NODE_ENV === "test" ? "test" : "development";
const isProduction = nodeEnv === "production";

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const originList = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  )
  .pipe(z.array(z.string().url()).min(1));

const trustProxy = z
  .string()
  .transform((value) => {
    const trimmed = value.trim();
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    return trimmed; // e.g. "loopback", "10.0.0.0/8"
  });

const schema = z
  .object({
    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().default("0.0.0.0"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default(isProduction ? "info" : "debug"),

    DATABASE_URL: z.string().regex(/^mysql:\/\//, "DATABASE_URL must be a mysql:// connection string"),
    DB_POOL_SIZE: z.coerce.number().int().min(1).max(20).default(3),
    DB_POOL_TIMEOUT_SECONDS: z.coerce.number().int().min(1).default(10),
    DB_CONNECT_TIMEOUT_SECONDS: z.coerce.number().int().min(1).default(10),

    JWT_SECRET: z.string().min(isProduction ? 32 : 16, isProduction ? "JWT_SECRET must be at least 32 characters in production" : "JWT_SECRET must be at least 16 characters"),
    JWT_EXPIRES_IN: z.string().default("15m"),

    CORS_ORIGINS: originList.optional(),
    CORS_ORIGIN: originList.optional(),
    FRONTEND_URL: z.string().url().optional(),
    TRUST_PROXY: trustProxy.optional(),

    COOKIE_SECURE: booleanString.optional(),
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    PUBLIC_CACHE_MAX_AGE: z.coerce.number().int().min(0).default(60),

    ENABLE_DOCS: booleanString.optional(),

    GOOGLE_CLIENT_ID: z.string().optional().default(""),

    EMAIL_TRANSPORT: z.enum(["smtp", "none"]).default("smtp"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: booleanString.default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (isProduction && !value.CORS_ORIGINS && !value.CORS_ORIGIN) {
      ctx.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "CORS_ORIGINS is required in production" });
    }
    if (value.COOKIE_SAME_SITE === "none" && value.COOKIE_SECURE === false) {
      ctx.addIssue({ code: "custom", path: ["COOKIE_SECURE"], message: "COOKIE_SAME_SITE=none requires COOKIE_SECURE=true" });
    }
    if (value.EMAIL_TRANSPORT === "smtp") {
      for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"] as const) {
        if (!value[key]) {
          ctx.addIssue({ code: "custom", path: [key], message: `${key} is required when EMAIL_TRANSPORT=smtp (set EMAIL_TRANSPORT=none to disable email)` });
        }
      }
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.issues.map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  // Logger is not available yet; this is the one place we write directly to stderr.
  process.stderr.write(`Invalid environment configuration:\n${lines.join("\n")}\n`);
  process.exit(1);
}

const raw = parsed.data;
const corsOrigins = raw.CORS_ORIGINS ?? raw.CORS_ORIGIN ?? ["http://localhost:3000"];

export const env = {
  nodeEnv,
  isProduction,
  port: raw.PORT,
  host: raw.HOST,
  logLevel: raw.LOG_LEVEL,

  databaseUrl: raw.DATABASE_URL,
  dbPoolSize: raw.DB_POOL_SIZE,
  dbPoolTimeoutSeconds: raw.DB_POOL_TIMEOUT_SECONDS,
  dbConnectTimeoutSeconds: raw.DB_CONNECT_TIMEOUT_SECONDS,

  jwtSecret: raw.JWT_SECRET,
  jwtExpiresIn: raw.JWT_EXPIRES_IN,

  corsOrigins,
  frontendUrl: raw.FRONTEND_URL ?? corsOrigins[0],
  trustProxy: raw.TRUST_PROXY ?? (isProduction ? 1 : false),

  cookieSecure: raw.COOKIE_SECURE ?? isProduction,
  cookieSameSite: raw.COOKIE_SAME_SITE,

  rateLimitWindowMs: raw.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: raw.RATE_LIMIT_MAX,
  authRateLimitMax: raw.AUTH_RATE_LIMIT_MAX,
  publicCacheMaxAge: raw.PUBLIC_CACHE_MAX_AGE,

  enableDocs: raw.ENABLE_DOCS ?? !isProduction,

  googleClientId: raw.GOOGLE_CLIENT_ID,

  emailTransport: raw.EMAIL_TRANSPORT,
  smtpHost: raw.SMTP_HOST ?? "",
  smtpPort: raw.SMTP_PORT,
  smtpSecure: raw.SMTP_SECURE,
  smtpUser: raw.SMTP_USER ?? "",
  smtpPass: raw.SMTP_PASS ?? "",
  mailFrom: raw.MAIL_FROM ?? "",
};

export type Env = typeof env;
