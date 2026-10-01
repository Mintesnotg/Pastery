import type { Response } from "express";

export function sendError(res: Response, status: number, error: string, detail?: unknown) {
  return res.status(status).json({ error, ...(detail ? { detail } : {}) });
}
