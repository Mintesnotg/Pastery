import { spawn } from "node:child_process";

const commands = [
  {
    name: "frontend",
    command: "npm",
    args: ["--prefix", "frontend", "run", "dev"],
  },
  {
    name: "backend",
    command: "npm",
    args: ["--prefix", "backend", "run", "dev"],
  },
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      for (const other of children) {
        if (other !== child) {
          other.kill();
        }
      }
      process.exit(code);
    }
  });

  return child;
});

process.on("SIGINT", () => {
  for (const child of children) child.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  for (const child of children) child.kill();
  process.exit(0);
});
