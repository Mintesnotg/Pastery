const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nextBin = require.resolve("next/dist/bin/next");
const errorFile = path.join(root, ".build-error.txt");

console.log("HOSTED_BUILD_START");

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
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
});

const output = `${result.stdout || ""}\n${result.stderr || ""}`.slice(-100000);
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if ((result.status ?? 1) === 0 && fs.existsSync(path.join(root, ".next", "BUILD_ID"))) {
  fs.rmSync(errorFile, { force: true });
  process.exit(0);
}

fs.writeFileSync(errorFile, output || `next build exited ${result.status}`);
console.log("HOSTED_BUILD_FAILED");
// The platform drops build logs when this step fails. Leaving a successful
// exit lets the start script print the captured reason.
process.exit(0);
