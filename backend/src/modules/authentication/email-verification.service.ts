import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../db/index.js";
import { env } from "../../config/env.js";
import { hashPassword } from "../../shared/lib/auth.js";
import { sendRegistrationLinkEmail } from "../../shared/lib/mailer.js";
import {
  createUser,
  findActiveUserByEmail,
  findUserByEmail,
  replaceUserRoles,
} from "../users/user.repository.js";
import { buildSessionForUser, findCustomerRoleId } from "./google-auth.service.js";

const REG_TOKEN_TTL = "30m";
const RESEND_COOLDOWN_MS = 60_000;

export type RegistrationTokenPayload = {
  purpose: "register";
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  passwordSalt: string;
};

const resendTimestamps = new Map<string, number>();

export function canResendVerification(email: string): boolean {
  const key = email.trim().toLowerCase();
  const last = resendTimestamps.get(key) ?? 0;
  if (Date.now() - last < RESEND_COOLDOWN_MS) return false;
  resendTimestamps.set(key, Date.now());
  return true;
}

/** Test helper: clear in-memory resend cooldown. */
export function clearResendTimestampsForTests() {
  resendTimestamps.clear();
}

function isPasswordComplex(password: string): boolean {
  return /[a-zA-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z\d]/.test(password);
}

export function signRegistrationToken(
  payload: Omit<RegistrationTokenPayload, "purpose">,
): string {
  const body: RegistrationTokenPayload = { purpose: "register", ...payload };
  const options: SignOptions = { expiresIn: REG_TOKEN_TTL };
  return jwt.sign(body, env.jwtSecret, options);
}

export function verifyRegistrationToken(
  token: string,
): RegistrationTokenPayload | { error: "invalid" | "expired" } {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as RegistrationTokenPayload;
    if (decoded.purpose !== "register" || !decoded.email || !decoded.passwordHash) {
      return { error: "invalid" };
    }
    return decoded;
  } catch (err) {
    if ((err as Error).name === "TokenExpiredError") return { error: "expired" };
    return { error: "invalid" };
  }
}

export async function sendRegistrationLink(
  email: string,
  token: string,
  name?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const verifyUrl = `${env.frontendUrl.replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
  return sendRegistrationLinkEmail(email, verifyUrl, name);
}

export type StartRegistrationResult =
  | { ok: true; email: string }
  | { conflict: true }
  | { weakPassword: true }
  | { invalid: true }
  | { sendFailed: true; error: string };

/**
 * Public register / resend: validate, ensure email free, email a signed link.
 * Does not insert into `users` until the link is verified.
 */
export async function startPublicRegistration(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<StartRegistrationResult> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const password = input.password;

  if (!email || !password || !firstName || !lastName) return { invalid: true };
  if (password.length < 8) return { invalid: true };
  if (!isPasswordComplex(password)) return { weakPassword: true };

  const existing = await findUserByEmail(email);
  if (existing) return { conflict: true };

  const hashed = hashPassword(password);
  const token = signRegistrationToken({
    email,
    firstName,
    lastName,
    passwordHash: hashed.hash,
    passwordSalt: hashed.salt,
  });

  const sent = await sendRegistrationLink(email, token, firstName);
  if (!sent.ok) {
    return { sendFailed: true, error: sent.error || "Failed to send verification email" };
  }

  return { ok: true, email };
}

export type CompleteRegistrationResult =
  | { ok: true; session: Awaited<ReturnType<typeof buildSessionForUser>>; alreadyExisted: boolean }
  | { error: "invalid" | "expired" | "customer_role_missing" };

export async function completeRegistrationFromToken(
  token: string,
): Promise<CompleteRegistrationResult> {
  const payload = verifyRegistrationToken(token);
  if ("error" in payload) return { error: payload.error };

  const email = payload.email.trim().toLowerCase();
  const existing = await findActiveUserByEmail(email);
  if (existing) {
    const session = await buildSessionForUser(existing.id, existing.email);
    return { ok: true, session, alreadyExisted: true };
  }

  const customerRoleId = await findCustomerRoleId();
  if (customerRoleId == null) return { error: "customer_role_missing" };

  const fullName = `${payload.firstName} ${payload.lastName}`.trim();

  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await createUser(
        {
          email,
          passwordHash: payload.passwordHash,
          passwordSalt: payload.passwordSalt,
          firstName: payload.firstName,
          lastName: payload.lastName,
          fullName,
          active: true,
          emailVerifiedAt: new Date(),
        },
        tx,
      );
      if (!user) return null;
      await replaceUserRoles(user.id, [customerRoleId], tx);
      return user;
    });

    if (!created) return { error: "invalid" };

    const session = await buildSessionForUser(created.id, created.email);
    return { ok: true, session, alreadyExisted: false };
  } catch (err) {
    const existingAfter = await findActiveUserByEmail(email);
    if (existingAfter) {
      const session = await buildSessionForUser(existingAfter.id, existingAfter.email);
      return { ok: true, session, alreadyExisted: true };
    }
    console.error("[registration] complete failed:", err);
    return { error: "invalid" };
  }
}
