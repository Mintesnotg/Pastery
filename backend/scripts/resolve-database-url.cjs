/**
 * Sets process.env.DATABASE_URL from GoDaddy DB_* vars when present.
 * Load before `prisma migrate deploy` / `prisma generate` in start scripts.
 */
function resolveDatabaseUrl() {
  const host = process.env.DB_HOST;
  if (!host) return process.env.DATABASE_URL;
  const user = encodeURIComponent(process.env.DB_USER ?? "");
  const pass = encodeURIComponent(process.env.DB_PASSWORD ?? "");
  const port = process.env.DB_PORT ?? "3306";
  const name = process.env.DB_NAME ?? "";
  const auth = pass ? `${user}:${pass}` : user;
  return `mysql://${auth}@${host}:${port}/${name}`;
}

const url = resolveDatabaseUrl();
if (url) process.env.DATABASE_URL = url;

module.exports = { resolveDatabaseUrl };
