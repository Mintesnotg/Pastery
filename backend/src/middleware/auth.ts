import type { NextFunction, Request, Response } from "express";
import { verifySession } from "../lib/auth.js";

export type AuthedRequest = Request & {
  auth?: {
    userId: string;
    email: string;
    roles: string[];
  };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.session || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  try {
    const session = verifySession(token);
    req.auth = { userId: session.sub, email: session.email, roles: session.roles };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}

export function requirePermission(permission: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (!req.auth.roles.includes(permission) && !req.auth.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
