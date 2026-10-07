import crypto from "node:crypto";
import { prisma } from "../../db/index.js";
import { env } from "../../config/env.js";
import { sendVerificationEmail } from "../../shared/lib/mailer.js";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function createRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function issueEmailVerification(userId: string, email: string, name?: string) {
  const raw = createRawToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt, isAccountVerified: false },
  });

  const verifyUrl = `${env.frontendUrl.replace(/\/+$/, "")}/account/verify?token=${encodeURIComponent(raw)}`;
  const sent = await sendVerificationEmail(email, verifyUrl, name);
  return { raw, verifyUrl, sent };
}

export async function consumeEmailVerificationToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });
  if (!row || row.isAccountVerified) return { error: "invalid" as const };
  if (row.expiresAt.getTime() < Date.now()) {
    return { error: "expired" as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    });
    await tx.emailVerificationToken.update({
      where: { id: row.id },
      data: { isAccountVerified: true },
    });
  });

  return { userId: row.userId };
}

const resendCooldown = new Map<string, number>();

export function canResendVerification(email: string) {
  const key = email.trim().toLowerCase();
  const last = resendCooldown.get(key) ?? 0;
  if (Date.now() - last < 60_000) return false;
  resendCooldown.set(key, Date.now());
  return true;
}
