import type { NextFunction, Request, Response } from "express";

const publicRoutes: Array<{ method?: string; pattern: RegExp }> = [
  { pattern: /^\/$/ },
  { pattern: /^\/health(?:\/|$)/ },
  { pattern: /^\/docs(?:\/|$)/ },
  { pattern: /^\/openapi\.json(?:\/|$)/ },
  { method: "POST", pattern: /^\/api\/auth\/login(?:\/|$)/ },
  { method: "GET", pattern: /^\/api\/products\/?$/ },
  { method: "GET", pattern: /^\/api\/product-categories\/?$/ },
  { method: "GET", pattern: /^\/api\/testimonials(?:\/|$)/ },
  { method: "GET", pattern: /^\/api\/banners\/?$/ },
  { method: "POST", pattern: /^\/api\/messages(?:\/|$)/ },
  { method: "POST", pattern: /^\/api\/orders(?:\/|$)/ },
  { method: "POST", pattern: /^\/api\/users\/?$/ },
];

const authOnlyRoutes: Array<{ method?: string; pattern: RegExp }> = [
  { method: "GET", pattern: /^\/api\/auth\/me(?:\/|$)/ },
  { method: "POST", pattern: /^\/api\/auth\/logout(?:\/|$)/ },
];

function matchRoute(method: string, path: string, routes: Array<{ method?: string; pattern: RegExp }>) {
  return routes.find((r) => (!r.method || r.method === method) && r.pattern.test(path));
}

export function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (matchRoute(req.method, req.path, publicRoutes)) {
    return next();
  }

  if (!req.auth) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (matchRoute(req.method, req.path, authOnlyRoutes)) {
    return next();
  }

  const requested = (req.get("X-Permission") ?? req.get("Permission"))?.trim();
  if (!requested) {
    return res.status(403).json({ error: "Forbidden: permission is missing" });
  }

  if (!req.permissions?.includes(requested)) {
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  }

  return next();
}
