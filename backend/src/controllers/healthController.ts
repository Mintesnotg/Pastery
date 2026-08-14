import type { Request, Response } from "express";
import { checkHealth } from "../services/healthService.js";

export async function healthController(_req: Request, res: Response) {
  const result = await checkHealth();
  if (result.ok) return res.json(result);
  return res.status(500).json(result);
}
