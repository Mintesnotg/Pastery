require("./resolve-database-url.cjs");
const { spawnSync } = require("child_process");
const path = require("path");

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. On GoDaddy Node.js Hosting, attach managed MySQL so DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD are injected.",
  );
  process.exit(1);
}

const backendRoot = path.resolve(__dirname, "..");

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: backendRoot,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "migrate", "deploy"]);
run("node", ["dist/bootstrap/ensure-admin-cli.js"]);
run("node", ["dist/server.js"]);
