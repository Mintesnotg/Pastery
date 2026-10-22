import pino from "pino";
import { env } from "../../config/env.js";

// Structured JSON logs to stdout. The hosting platform captures stdout/stderr.
export const logger = pino({
  level: env.logLevel,
  base: undefined, // omit pid/hostname noise
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.passwordHash",
      "*.passwordSalt",
      "*.token",
      "*.idToken",
    ],
    censor: "[redacted]",
  },
});
