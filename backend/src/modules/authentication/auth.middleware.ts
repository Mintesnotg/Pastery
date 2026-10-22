import type { NextFunction, Request, Response } from "express";
import { verifySession } from "../../shared/lib/auth.js";

export type AuthContext = {
  userId: string;
  email: string;
  roleIds: number[];
  roles: string[];
};

export type AuthedRequest = Request & {
  auth?: AuthContext;
  user?: AuthContext;
  permissions?: string[];
};

const publicPrefixes = [
  "/",
  "/health",
  "/docs",
  "/openapi.json",
  "/api/auth/login",
  "/api/auth/google",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
];

function getSessionToken(req: Request) {
  const cookieToken = req.cookies?.session || req.header("authorization")?.replace(/^Bearer\s+/i, "");
  return cookieToken;
}

function isPublicRequest(req: Request) {
  return publicPrefixes.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`));
}

export function parseAuth(req: Request) {
  const token = getSessionToken(req);
  if (!token) return null;
  const session = verifySession(token);
  return {
    userId: session.sub,
    email: session.email,
    roleIds: session.roleIds ?? [],
    roles: session.roles ?? [],
  } satisfies AuthContext;
}

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (isPublicRequest(req)) {
    return next();
  }
  const token = getSessionToken(req);
  if (!token) {
    return next();
  }

  try {
    const auth = parseAuth(req);
    if (auth) {
      req.auth = auth;
      req.user = auth;
    }
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}
