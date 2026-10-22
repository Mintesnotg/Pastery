import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";

// Anonymous GET endpoints that serve storefront content and are safe to cache briefly.
const publicCacheableRoutes = [
  /^\/api\/products\/?$/,
  /^\/api\/product-categories\/?$/,
  /^\/api\/testimonials\/?$/,
  /^\/api\/banners\/?$/,
];

export function cacheControlMiddleware(req: Request, res: Response, next: NextFunction) {
  const cacheable =
    req.method === "GET" &&
    !req.auth &&
    env.publicCacheMaxAge > 0 &&
    publicCacheableRoutes.some((pattern) => pattern.test(req.path));

  res.set("Cache-Control", cacheable ? `public, max-age=${env.publicCacheMaxAge}` : "no-store");
  next();
}
