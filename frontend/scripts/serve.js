const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const port = Number(process.env.PORT || 3000);
const buildId = path.join(root, ".next", "BUILD_ID");

if (!fs.existsSync(buildId)) {
  console.error("Production build is missing. Refusing to start.");
  process.exit(1);
}

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(
  process.execPath,
  [nextBin, "start", "-H", "0.0.0.0", "-p", String(port)],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  },
);
child.on("exit", (code) => process.exit(code ?? 1));
