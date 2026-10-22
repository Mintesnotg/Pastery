import type { Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../lib/logger.js";

/**
 * Sends a JSON error body. Internal detail for 5xx responses is logged and,
 * in production, withheld from the client so driver/ORM messages never leak.
 */
export function sendError(res: Response, status: number, error: string, detail?: unknown) {
  const isServerError = status >= 500;
  if (isServerError && detail) {
    logger.error({ status, error, detail }, "request failed");
  }
  const exposeDetail = Boolean(detail) && !(isServerError && env.isProduction);
  return res.status(status).json({ error, ...(exposeDetail ? { detail } : {}) });
}
