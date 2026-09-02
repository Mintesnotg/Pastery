import type { NextFunction, Request, Response } from "express";
import { getPermissionsByRoleIds } from "./permission.service.js";

export async function permissionsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) {
    return next();
  }

  if (!Array.isArray(req.auth.roleIds)) {
    return res.status(403).json({ error: "unauthorized: missing role assignments" });
  }

  if (req.auth.roleIds.length === 0) {
    return res.status(403).json({ error: "unauthorized: no roles found for user" });
  }

  try {
    const permissions = await getPermissionsByRoleIds(req.auth.roleIds);
    req.permissions = permissions;
    return next();
  } catch {
    return res.status(500).json({ error: "failed to load permissions" });
  }
}
