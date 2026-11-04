/**
 * Run a command with DATABASE_URL set.
 * GoDaddy injects DB_*; Prisma still requires DATABASE_URL for generate.
 * A placeholder is used only when neither is set, so `prisma generate`
 * can run during install/build. It is never used to migrate or serve.
 */
require("./resolve-database-url.cjs");
const { spawnSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mysql://build:build@127.0.0.1:3306/build";
}

const args = process.argv.slice(2);
if (args.length === 0) process.exit(0);

const result = spawnSync(args[0], args.slice(1), {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
