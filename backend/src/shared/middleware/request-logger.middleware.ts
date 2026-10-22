import type { Request } from "express";
import { pinoHttp } from "pino-http";
import { logger } from "../lib/logger.js";

export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === "/health" || req.url?.startsWith("/health/") === true,
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: (req.raw as Request).ip,
    }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
