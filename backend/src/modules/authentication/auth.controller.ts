import type { Request, Response } from "express";
import { getPermissionsByRoleIds } from "../permissions/permission.service.js";
import {
  findActiveUserByEmail,
  findUserById,
} from "../users/user.repository.js";
import { updateUser } from "../users/user.service.js";
import { sendError } from "../../shared/utils/response.js";
import type { AuthedRequest } from "./auth.middleware.js";
import { login } from "./auth.service.js";
import {
  googleAuthSchema,
  loginSchema,
  profileUpdateSchema,
  resendVerificationSchema,
} from "./auth.validator.js";
import { loginWithGoogleIdToken, buildSessionForUser } from "./google-auth.service.js";
import {
  canResendVerification,
  consumeEmailVerificationToken,
  issueEmailVerification,
} from "./email-verification.service.js";

function setSessionCookie(res: Response, token: string) {
  res.cookie("session", token, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
}

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request");
  const result = await login(parsed.data.email, parsed.data.password);
  if (!result) return res.status(401).json({ message: "Invalid credentials" });
  if ("emailNotVerified" in result) {
    return res.status(403).json({
      error: "Email not verified",
      code: "EMAIL_NOT_VERIFIED",
      email: result.email,
    });
  }
  setSessionCookie(res, result.token);
  res.json({ token: result.token, roleIds: result.roleIds });
}

export async function googleAuthController(req: Request, res: Response) {
  const parsed = googleAuthSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request");

  const result = await loginWithGoogleIdToken(parsed.data.idToken);
  if ("error" in result) {
    if (result.error === "google_not_configured") {
      return sendError(res, 503, "Google sign-in is not configured");
    }
    if (result.error === "customer_role_missing") {
      return sendError(res, 500, "Customer role is not configured");
    }
    if (result.error === "inactive") {
      return sendError(res, 403, "Account is inactive");
    }
    return sendError(res, 401, "Google sign-in failed");
  }

  setSessionCookie(res, result.session.token);
  res.json({
    token: result.session.token,
    roleIds: result.session.roleIds,
    user: result.session.user,
  });
}

export async function verifyEmailController(req: Request, res: Response) {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) return sendError(res, 400, "Missing verification token");

  const result = await consumeEmailVerificationToken(token);
  if ("error" in result) {
    if (result.error === "expired") return sendError(res, 400, "Verification link expired");
    return sendError(res, 400, "Invalid verification link");
  }

  const user = await findUserById(result.userId);
  if (!user || !user.active) return sendError(res, 404, "User not found");

  const session = await buildSessionForUser(user.id, user.email);
  setSessionCookie(res, session.token);
  res.json({
    success: true,
    token: session.token,
    roleIds: session.roleIds,
    message: "Email verified",
  });
}

export async function resendVerificationController(req: Request, res: Response) {
  const parsed = resendVerificationSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request");

  const email = parsed.data.email.trim().toLowerCase();
  if (!canResendVerification(email)) {
    return sendError(res, 429, "Please wait before requesting another email");
  }

  const user = await findActiveUserByEmail(email);
  // Always return success-shaped response to avoid email enumeration
  if (!user || user.emailVerifiedAt) {
    return res.json({ success: true, message: "If an unverified account exists, a new email was sent." });
  }

  const issued = await issueEmailVerification(user.id, user.email);
  if (!issued.sent.ok) {
    return sendError(res, 502, issued.sent.error || "Failed to send verification email");
  }

  res.json({ success: true, message: "Verification email sent." });
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
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? req.auth.email,
    emailVerifiedAt: user?.emailVerifiedAt ?? null,
    permissions,
  });
}

export async function updateMeController(req: AuthedRequest, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request");

  const result = await updateUser(req.auth.userId, {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
  });

  if (!result) return sendError(res, 404, "User not found");
  if ("invalidRoleIds" in result) return sendError(res, 400, "Invalid role IDs");

  res.json({
    success: true,
    user: {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      fullName: result.fullName,
    },
  });
}

export async function logoutController(_req: Request, res: Response) {
  res.clearCookie("session", { path: "/" });
  res.json({ success: true });
}
