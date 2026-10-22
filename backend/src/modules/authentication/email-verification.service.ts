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

export async function issueEmailVerification(userId: string, email: string) {
  const raw = createRawToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  const verifyUrl = `${env.frontendUrl.replace(/\/+$/, "")}/account/verify?token=${encodeURIComponent(raw)}`;
  const sent = await sendVerificationEmail(email, verifyUrl);
  return { raw, verifyUrl, sent };
}

export async function consumeEmailVerificationToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });
  if (!row) return { error: "invalid" as const };
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { id: row.id } }).catch(() => null);
    return { error: "expired" as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    });
    await tx.emailVerificationToken.deleteMany({ where: { userId: row.userId } });
  });

  return { userId: row.userId };
}

const RESEND_COOLDOWN_MS = 60_000;
const RESEND_PRUNE_THRESHOLD = 1_000;
const resendCooldown = new Map<string, number>();

// Keep the in-memory throttle bounded on a long-running process.
function pruneExpiredCooldowns(now: number) {
  if (resendCooldown.size < RESEND_PRUNE_THRESHOLD) return;
  for (const [key, last] of resendCooldown) {
    if (now - last >= RESEND_COOLDOWN_MS) resendCooldown.delete(key);
  }
}

export function canResendVerification(email: string) {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  pruneExpiredCooldowns(now);
  const last = resendCooldown.get(key) ?? 0;
  if (now - last < RESEND_COOLDOWN_MS) return false;
  resendCooldown.set(key, now);
  return true;
}
