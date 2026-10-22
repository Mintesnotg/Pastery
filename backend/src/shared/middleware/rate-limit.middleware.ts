import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";

const shared = {
  windowMs: env.rateLimitWindowMs,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  // CORS preflights are answered earlier by the cors middleware; never count them.
  skip: (req: { method: string }) => req.method === "OPTIONS",
};

/** General per-IP limit for everything under /api. */
export const apiRateLimiter = rateLimit({ ...shared, limit: env.rateLimitMax });

/** Tighter per-IP limit for credential and email-sending endpoints. */
export const authRateLimiter = rateLimit({ ...shared, limit: env.authRateLimitMax });
