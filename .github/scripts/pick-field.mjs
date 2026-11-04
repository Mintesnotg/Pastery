import { readFileSync } from "node:fs";

const key = process.argv[2];
const text = readFileSync(0, "utf8");
if (!key) process.exit(0);

const json = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
if (json) {
  process.stdout.write(json[1]);
  process.exit(0);
}

const yaml = text.match(new RegExp(`(?:^|\\n)\\s*${key}\\s*:\\s*"?([^"\\n,]+)"?`, "i"));
if (yaml) process.stdout.write(yaml[1].trim());
