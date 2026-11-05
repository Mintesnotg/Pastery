const { spawnSync } = require("node:child_process");
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

// GoDaddy runs `npm run dev` and assigns PORT. Turbopack tries to bind
// another port while compiling CSS, and the host rejects that. Webpack
// does not, so the hosted process builds with webpack and then serves it.
if (process.env.PORT) {
  spawnSync(process.execPath, [path.join(__dirname, "build-hosted.js")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  spawnSync(process.execPath, [path.join(__dirname, "serve.js")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  process.exit(0);
}

run(["dev"]);
