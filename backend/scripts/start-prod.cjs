require("./resolve-database-url.cjs");
const { spawnSync } = require("child_process");
const path = require("path");

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
run("node", ["dist/server.js"]);
