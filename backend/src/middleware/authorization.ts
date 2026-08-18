import type { NextFunction, Request, Response } from "express";

type AuthorizationRule = {
  method: string;
  pattern: RegExp;
  permission?: string;
  authRequired?: boolean;
};

const publicRoutes: Array<{ method?: string; pattern: RegExp }> = [
  { pattern: /^\/$/ },
  { pattern: /^\/health(?:\/|$)/ },
  { pattern: /^\/docs(?:\/|$)/ },
  { pattern: /^\/openapi\.json(?:\/|$)/ },
  { method: "POST", pattern: /^\/api\/auth\/login(?:\/|$)/ },
  { method: "GET", pattern: /^\/api\/products(?:\/|$)/ },
  { method: "GET", pattern: /^\/api\/testimonials(?:\/|$)/ },
  { method: "POST", pattern: /^\/api\/messages(?:\/|$)/ },
  { method: "POST", pattern: /^\/api\/orders(?:\/|$)/ },
];

const authorizationRules: AuthorizationRule[] = [
  { method: "GET", pattern: /^\/api\/auth\/me(?:\/|$)/, authRequired: true },
  { method: "POST", pattern: /^\/api\/auth\/logout(?:\/|$)/, authRequired: true },
  { method: "GET", pattern: /^\/api\/messages(?:\/|$)/, permission: "messages.read", authRequired: true },
  { method: "DELETE", pattern: /^\/api\/messages\/[^/]+(?:\/|$)/, permission: "messages.delete", authRequired: true },
  { method: "GET", pattern: /^\/api\/orders(?:\/|$)/, permission: "orders.read", authRequired: true },
  { method: "PUT", pattern: /^\/api\/orders\/[^/]+(?:\/|$)/, permission: "orders.write", authRequired: true },
  { method: "DELETE", pattern: /^\/api\/orders\/[^/]+(?:\/|$)/, permission: "orders.delete", authRequired: true },
  { method: "GET", pattern: /^\/api\/users(?:\/|$)/, permission: "users.read", authRequired: true },
  { method: "POST", pattern: /^\/api\/users(?:\/|$)/, permission: "users.create", authRequired: true },
  { method: "PUT", pattern: /^\/api\/users\/[^/]+(?:\/|$)/, permission: "users.update", authRequired: true },
  { method: "DELETE", pattern: /^\/api\/users\/[^/]+(?:\/|$)/, permission: "users.delete", authRequired: true },
  { method: "GET", pattern: /^\/api\/roles(?:\/|$)/, permission: "roles.read", authRequired: true },
  { method: "POST", pattern: /^\/api\/roles(?:\/|$)/, permission: "roles.create", authRequired: true },
  { method: "PUT", pattern: /^\/api\/roles\/[^/]+(?:\/|$)/, permission: "roles.update", authRequired: true },
  { method: "DELETE", pattern: /^\/api\/roles\/[^/]+(?:\/|$)/, permission: "roles.delete", authRequired: true },
  { method: "GET", pattern: /^\/api\/permissions(?:\/|$)/, permission: "permissions.read", authRequired: true },
  { method: "POST", pattern: /^\/api\/permissions(?:\/|$)/, permission: "permissions.create", authRequired: true },
  { method: "PUT", pattern: /^\/api\/permissions\/[^/]+(?:\/|$)/, permission: "permissions.update", authRequired: true },
  { method: "DELETE", pattern: /^\/api\/permissions\/[^/]+(?:\/|$)/, permission: "permissions.delete", authRequired: true },
];

function matchRule(method: string, path: string, rules: Array<{ method?: string; pattern: RegExp }>) {
  return rules.find((rule) => (!rule.method || rule.method === method) && rule.pattern.test(path));
}

function matchAuthorizationRule(method: string, path: string) {
  return authorizationRules.find((rule) => rule.method === method && rule.pattern.test(path));
}

function hasPermission(permissions: string[] | undefined, required: string) {
  return permissions?.includes(required) ?? false;
}

export function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (matchRule(req.method, req.path, publicRoutes)) {
    return next();
  }

  const rule = matchAuthorizationRule(req.method, req.path);
  if (!rule) {
    return next();
  }

  if (rule.authRequired && !req.auth) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (!rule.permission) {
    return next();
  }

  const requested = req.get("Permission")?.trim() || req.get("X-Permission")?.trim();
  if (!requested) {
    return res.status(403).json({ error: "unauthorized: missing permission header" });
  }

  if (requested !== rule.permission) {
    return res.status(403).json({ error: "unauthorized: missing required permission" });
  }

  if (!hasPermission(req.permissions, requested)) {
    return res.status(403).json({ error: "unauthorized: missing required permission" });
  }

  return next();
}
