import type { Request, Response } from "express";
import { getPermissionsByRoleIds } from "../permissions/permission.service.js";
import { findUserById } from "../users/user.repository.js";
import { sendError } from "../../shared/utils/response.js";
import type { AuthedRequest } from "./auth.middleware.js";
import { login } from "./auth.service.js";
import { loginSchema } from "./auth.validator.js";

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request");
  const result = await login(parsed.data.email, parsed.data.password);
  if (!result) return res.status(401).json({ message: "Invalid credentials" });
  res.cookie("session", result.token, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json({ token: result.token, roleIds: result.roleIds });
}

export async function meController(req: AuthedRequest, res: Response) {
  if (!req.auth) return sendError(res, 401, "Unauthenticated");

  const roleIds = req.auth?.roleIds ?? [];
  const permissions = await getPermissionsByRoleIds(roleIds);
  const user = await findUserById(req.auth.userId);
  const fullName = user?.fullName ?? null;

  res.json({
    authenticated: true,
    user: req.auth,
    fullName,
    full_name: fullName,
    permissions,
  });
}

export async function logoutController(_req: Request, res: Response) {
  res.clearCookie("session", { path: "/" });
  res.json({ success: true });
}
