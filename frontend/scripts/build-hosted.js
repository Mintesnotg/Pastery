const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nextBin = require.resolve("next/dist/bin/next");

// Next.js treats TURBOPACK in the environment as an explicit bundler
// choice, which rejects `--webpack`. The host cannot run Turbopack.
const env = { ...process.env };
delete env.TURBOPACK;
delete env.IS_TURBOPACK_TEST;

const result = spawnSync(process.execPath, [nextBin, "build", "--webpack"], {
  cwd: root,
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
