import type { Request, Response } from "express";
import { getPermissionsByRoleIds } from "../permissions/permission.service.js";
import { findUserById } from "../users/user.repository.js";
import { updateUser } from "../users/user.service.js";
import { sendError } from "../../shared/utils/response.js";
import type { AuthedRequest } from "./auth.middleware.js";
import { login } from "./auth.service.js";
import {
  googleAuthSchema,
  loginSchema,
  profileUpdateSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from "./auth.validator.js";
import { loginWithGoogleIdToken } from "./google-auth.service.js";
import {
  canResendVerification,
  completeRegistrationFromToken,
  startPublicRegistration,
} from "./email-verification.service.js";

function setSessionCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("session", token, {
    httpOnly: true,
    // Cross-subdomain / two-host PaaS: None+Secure required for credentialed fetches
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });
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
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Verification token is required");

  const result = await completeRegistrationFromToken(parsed.data.token);
  if ("error" in result) {
    if (result.error === "expired") {
      return sendError(res, 400, "Verification link expired. Register or resend to get a new one.");
    }
    if (result.error === "customer_role_missing") {
      return sendError(res, 500, "Customer role is not configured");
    }
    return sendError(res, 400, "Invalid verification link.");
  }

  setSessionCookie(res, result.session.token);
  res.json({
    success: true,
    token: result.session.token,
    roleIds: result.session.roleIds,
    alreadyExisted: result.alreadyExisted,
    message: result.alreadyExisted
      ? "Email already verified. You are signed in."
      : "Email verified. You are signed in.",
  });
}

export async function resendVerificationController(req: Request, res: Response) {
  const parsed = resendVerificationSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request");

  const email = parsed.data.email.trim().toLowerCase();
  if (!canResendVerification(email)) {
    return sendError(res, 429, "Please wait before requesting another email");
  }

  const result = await startPublicRegistration({
    email: parsed.data.email,
    password: parsed.data.password,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
  });

  if ("invalid" in result) return sendError(res, 400, "Invalid registration payload");
  if ("weakPassword" in result) {
    return sendError(
      res,
      400,
      "Password must contain at least one letter, one number, and one special character",
    );
  }
  if ("conflict" in result) {
    return sendError(res, 409, "An account with this email already exists. Please sign in.");
  }
  if ("sendFailed" in result) {
    return sendError(res, 503, result.error || "Failed to send verification email");
  }

  res.json({
    success: true,
    email: result.email,
    message: "Verification link sent. Check your email.",
  });
}

/** Legacy OTP endpoint — clients should use /verify-email with a link token. */
export async function verifyOtpController(_req: Request, res: Response) {
  return sendError(
    res,
    410,
    "OTP verification is no longer supported. Use the link in your email or register again.",
  );
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
