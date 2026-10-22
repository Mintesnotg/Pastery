import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../lib/logger.js";

type HttpError = Error & { status?: number; statusCode?: number; expose?: boolean };

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const error = (err instanceof Error ? err : new Error(String(err))) as HttpError;
  const status = Number(error.status ?? error.statusCode) || 500;
  const log = req.log ?? logger;

  if (status >= 500) {
    log.error({ err: error, status }, "unhandled request error");
  } else {
    log.warn({ status, message: error.message }, "request rejected");
  }

  if (res.headersSent) {
    return next(err);
  }

  // 4xx errors raised by body-parser etc. carry safe, client-facing messages.
  const clientMessage = status < 500 && error.expose !== false ? error.message : "Internal server error";
  const body: { error: string; detail?: string } = { error: clientMessage || "Request failed" };
  if (!env.isProduction && status >= 500) body.detail = error.message;

  res.status(status).json(body);
}
