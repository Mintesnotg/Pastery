import type { Request, Response } from "express";
import { z } from "zod";
import { ensureBootstrapAdmin, login } from "../services/authService.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { sendError } from "../utils/response.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginController(req: Request, res: Response) {
  await ensureBootstrapAdmin();
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid credentials");
  const result = await login(parsed.data.email, parsed.data.password);
  if (!result) return sendError(res, 401, "Invalid email or password");
  res.cookie("session", result.session, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json({ success: true, user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName } });
}

export async function meController(req: AuthedRequest, res: Response) {
  res.json({ authenticated: true, user: req.auth });
}

export async function logoutController(_req: Request, res: Response) {
  res.clearCookie("session", { path: "/" });
  res.json({ success: true });
}
