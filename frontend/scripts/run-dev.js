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
  const build = spawnSync(process.execPath, [path.join(__dirname, "build-hosted.js")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if ((build.status ?? 1) !== 0) process.exit(build.status ?? 1);
  const serve = spawnSync(process.execPath, [path.join(__dirname, "serve.js")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  process.exit(serve.status ?? 1);
}

run(["dev"]);
