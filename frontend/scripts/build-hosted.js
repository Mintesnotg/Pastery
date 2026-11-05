const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nextBin = require.resolve("next/dist/bin/next");

// Next.js treats TURBOPACK in the environment as an explicit bundler
// choice, which rejects `--webpack`. The host cannot run Turbopack.
const env = { ...process.env };
delete env.TURBOPACK;
delete env.IS_TURBOPACK_TEST;
// GoDaddy sets a custom NODE_ENV. Next.js then prerenders with a broken
// React dispatcher (useContext is null) and the build stops.
env.NODE_ENV = "production";

const result = spawnSync(process.execPath, [nextBin, "build", "--webpack"], {
  cwd: root,
  env,
  stdio: "inherit",
});

if ((result.status ?? 1) !== 0 || !fs.existsSync(path.join(root, ".next", "BUILD_ID"))) {
  process.exit(result.status || 1);
}

process.exit(0);
