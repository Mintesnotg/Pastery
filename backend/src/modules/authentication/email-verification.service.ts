import crypto from "node:crypto";
import { prisma } from "../../db/index.js";
import { env } from "../../config/env.js";
import { sendVerificationEmail } from "../../shared/lib/mailer.js";
import { findActiveUserByEmail } from "../users/user.repository.js";

const OTP_TTL_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_RESENDS_PER_HOUR = 5;

export function generateOtpCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(otp: string): string {
  return crypto.createHmac("sha256", env.jwtSecret).update(otp).digest("hex");
}

export function otpsMatch(rawOtp: string, otpHash: string): boolean {
  const a = Buffer.from(hashOtp(rawOtp), "utf8");
  const b = Buffer.from(otpHash, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const resendCooldown = new Map<string, number>();

export function canResendVerification(email: string): boolean {
  const key = email.trim().toLowerCase();
  const last = resendCooldown.get(key) ?? 0;
  if (Date.now() - last < RESEND_COOLDOWN_MS) return false;
  resendCooldown.set(key, Date.now());
  return true;
}

/** Test helper: clear in-memory resend cooldown. */
export function clearResendCooldownForTests() {
  resendCooldown.clear();
}

async function countRecentIssues(userId: string): Promise<number> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  return prisma.emailVerificationOtp.count({
    where: { userId, createdAt: { gte: since } },
  });
}

export async function issueEmailVerification(
  userId: string,
  email: string,
  name?: string,
): Promise<{ sent: { ok: true } | { ok: false; error: string }; rateLimited?: boolean }> {
  const recent = await countRecentIssues(userId);
  if (recent >= MAX_RESENDS_PER_HOUR) {
    return { sent: { ok: false, error: "Too many verification emails. Try again later." }, rateLimited: true };
  }

  const otp = generateOtpCode();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Soft-invalidate prior OTPs so hourly resend history remains countable
  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationOtp.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await tx.emailVerificationOtp.create({
      data: { userId, otpHash, expiresAt, attemptCount: 0 },
    });
  });

  const sent = await sendVerificationEmail(email, otp, name);
  return { sent };
}

export type VerifyOtpError = "invalid" | "expired" | "locked" | "already_verified";

export async function verifyEmailOtp(
  email: string,
  code: string,
): Promise<{ userId: string } | { error: VerifyOtpError }> {
  const normalized = email.trim().toLowerCase();
  const user = await findActiveUserByEmail(normalized);
  if (!user) return { error: "invalid" };
  if (user.emailVerifiedAt) return { error: "already_verified" };

  const row = await prisma.emailVerificationOtp.findFirst({
    where: { userId: user.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!row) return { error: "invalid" };

  if (row.attemptCount >= MAX_ATTEMPTS) {
    return { error: "locked" };
  }

  if (row.expiresAt.getTime() < Date.now()) {
    return { error: "expired" };
  }

  if (!otpsMatch(code, row.otpHash)) {
    const updated = await prisma.emailVerificationOtp.update({
      where: { id: row.id },
      data: { attemptCount: { increment: 1 } },
    });
    if (updated.attemptCount >= MAX_ATTEMPTS) {
      await prisma.emailVerificationOtp.update({
        where: { id: row.id },
        data: { consumedAt: new Date() },
      });
      return { error: "locked" };
    }
    return { error: "invalid" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
    await tx.emailVerificationOtp.update({
      where: { id: row.id },
      data: { consumedAt: new Date() },
    });
  });

  return { userId: user.id };
}
