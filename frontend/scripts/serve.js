const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = path.join(__dirname, "..");
const port = Number(process.env.PORT || 3000);
const buildId = path.join(root, ".next", "BUILD_ID");
const errorFile = path.join(root, ".build-error.txt");

if (fs.existsSync(buildId) && !fs.existsSync(errorFile)) {
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
} else {
  const message = fs.existsSync(errorFile)
    ? fs.readFileSync(errorFile, "utf8")
    : "The production build did not finish.";
  console.error(message);
  http.createServer((_req, res) => {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(message);
  }).listen(port, "0.0.0.0");
}
