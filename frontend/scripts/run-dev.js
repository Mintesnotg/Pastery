const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nextBin = require.resolve("next/dist/bin/next");

function run(args) {
  const result = spawnSync(process.execPath, [nextBin, ...args], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

// GoDaddy runs `npm run dev` and assigns PORT. Turbopack cannot bind its
// extra port there, so the hosted process serves the production build.
if (process.env.PORT) {
  const buildId = path.join(root, ".next", "BUILD_ID");
  if (!fs.existsSync(buildId)) {
    const build = spawnSync(process.execPath, [nextBin, "build"], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    if ((build.status ?? 1) !== 0) process.exit(build.status ?? 1);
  }
  run(["start", "-H", "0.0.0.0", "-p", process.env.PORT]);
}

run(["dev"]);
