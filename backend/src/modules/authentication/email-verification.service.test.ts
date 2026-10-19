import { beforeEach, describe, expect, it, vi } from "vitest";

type OtpRow = {
  id: string;
  userId: string;
  otpHash: string;
  expiresAt: Date;
  attemptCount: number;
  consumedAt: Date | null;
  createdAt: Date;
};

type UserRow = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  active: boolean;
  firstName: string;
};

const {
  otpStore,
  users,
  sendVerificationEmail,
  db,
} = vi.hoisted(() => {
  const otpStore: OtpRow[] = [];
  const users = new Map<string, UserRow>();
  const sendVerificationEmail = vi.fn(async (_email: string, _otp: string, _name?: string) => ({
    ok: true as const,
  }));

  const db = {
    emailVerificationOtp: {
      count: async ({ where }: { where: { userId: string; createdAt: { gte: Date } } }) =>
        otpStore.filter(
          (r) => r.userId === where.userId && r.createdAt.getTime() >= where.createdAt.gte.getTime(),
        ).length,
      create: async ({
        data,
      }: {
        data: { userId: string; otpHash: string; expiresAt: Date; attemptCount: number };
      }) => {
        const row: OtpRow = {
          id: crypto.randomUUID(),
          userId: data.userId,
          otpHash: data.otpHash,
          expiresAt: data.expiresAt,
          attemptCount: data.attemptCount,
          consumedAt: null,
          createdAt: new Date(),
        };
        otpStore.push(row);
        return row;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { userId: string; consumedAt: null };
        data: { consumedAt: Date };
      }) => {
        let count = 0;
        for (const row of otpStore) {
          if (row.userId === where.userId && row.consumedAt === null) {
            row.consumedAt = data.consumedAt;
            count += 1;
          }
        }
        return { count };
      },
      findFirst: async ({ where }: { where: { userId: string; consumedAt: null } }) => {
        const rows = otpStore
          .filter((r) => r.userId === where.userId && r.consumedAt === null)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return rows[0] ?? null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { attemptCount?: { increment: number }; consumedAt?: Date };
      }) => {
        const row = otpStore.find((r) => r.id === where.id);
        if (!row) throw new Error("not found");
        if (data.attemptCount?.increment) row.attemptCount += data.attemptCount.increment;
        if (data.consumedAt) row.consumedAt = data.consumedAt;
        return { ...row };
      },
    },
    user: {
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { emailVerifiedAt: Date };
      }) => {
        const user = users.get(where.id);
        if (!user) throw new Error("user missing");
        user.emailVerifiedAt = data.emailVerifiedAt;
        return user;
      },
    },
    async $transaction(fn: (tx: typeof db) => Promise<unknown>) {
      return fn(db);
    },
  };

  return { otpStore, users, sendVerificationEmail, db };
});

vi.mock("../../config/env.js", () => ({
  env: { jwtSecret: "test-jwt-secret-for-otp" },
}));

vi.mock("../../shared/lib/mailer.js", () => ({
  sendVerificationEmail: (...args: unknown[]) =>
    sendVerificationEmail(...(args as [string, string, string?])),
}));

vi.mock("../users/user.repository.js", () => ({
  findActiveUserByEmail: async (email: string) => {
    const user = [...users.values()].find((u) => u.email === email && u.active);
    return user ?? null;
  },
}));

vi.mock("../../db/index.js", () => ({
  prisma: db,
}));

import {
  clearResendCooldownForTests,
  generateOtpCode,
  hashOtp,
  issueEmailVerification,
  verifyEmailOtp,
} from "./email-verification.service.js";

describe("email verification OTP", () => {
  const userId = "user-1";
  const email = "baker@example.com";

  beforeEach(() => {
    otpStore.length = 0;
    users.clear();
    users.set(userId, {
      id: userId,
      email,
      emailVerifiedAt: null,
      active: true,
      firstName: "Baker",
    });
    sendVerificationEmail.mockReset();
    sendVerificationEmail.mockResolvedValue({ ok: true });
    clearResendCooldownForTests();
  });

  it("generates a 6-digit zero-padded code", () => {
    for (let i = 0; i < 20; i += 1) {
      expect(generateOtpCode()).toMatch(/^\d{6}$/);
    }
  });

  it("activates the account for the correct OTP", async () => {
    let captured = "";
    sendVerificationEmail.mockImplementation(async (_email, otp) => {
      captured = otp;
      return { ok: true };
    });

    await issueEmailVerification(userId, email, "Baker");
    expect(captured).toMatch(/^\d{6}$/);
    expect(otpStore).toHaveLength(1);
    expect(otpStore[0]?.otpHash).toBe(hashOtp(captured));

    const result = await verifyEmailOtp(email, captured);
    expect(result).toEqual({ userId });
    expect(users.get(userId)?.emailVerifiedAt).toBeInstanceOf(Date);
    expect(otpStore[0]?.consumedAt).toBeInstanceOf(Date);
  });

  it("rejects a wrong OTP without activating", async () => {
    let captured = "";
    sendVerificationEmail.mockImplementation(async (_email, otp) => {
      captured = otp;
      return { ok: true };
    });
    await issueEmailVerification(userId, email);

    const wrong = captured === "000000" ? "111111" : "000000";
    const result = await verifyEmailOtp(email, wrong);
    expect(result).toEqual({ error: "invalid" });
    expect(users.get(userId)?.emailVerifiedAt).toBeNull();
    expect(otpStore[0]?.attemptCount).toBe(1);
  });

  it("rejects an expired OTP", async () => {
    let captured = "";
    sendVerificationEmail.mockImplementation(async (_email, otp) => {
      captured = otp;
      return { ok: true };
    });
    await issueEmailVerification(userId, email);
    otpStore[0]!.expiresAt = new Date(Date.now() - 1000);

    const result = await verifyEmailOtp(email, captured);
    expect(result).toEqual({ error: "expired" });
    expect(users.get(userId)?.emailVerifiedAt).toBeNull();
  });

  it("invalidates the previous OTP when a new one is issued", async () => {
    const codes: string[] = [];
    sendVerificationEmail.mockImplementation(async (_email, otp) => {
      codes.push(otp);
      return { ok: true };
    });

    await issueEmailVerification(userId, email);
    await issueEmailVerification(userId, email);

    expect(codes).toHaveLength(2);
    expect(otpStore).toHaveLength(2);
    expect(otpStore[0]?.consumedAt).toBeInstanceOf(Date);
    expect(otpStore[1]?.consumedAt).toBeNull();

    expect(await verifyEmailOtp(email, codes[0]!)).toEqual({ error: "invalid" });
    expect(await verifyEmailOtp(email, codes[1]!)).toEqual({ userId });
  });

  it("locks after 5 wrong attempts until a new OTP is issued", async () => {
    const codes: string[] = [];
    sendVerificationEmail.mockImplementation(async (_email, otp) => {
      codes.push(otp);
      return { ok: true };
    });
    await issueEmailVerification(userId, email);

    const first = codes[0]!;
    const wrong = first === "000000" ? "111111" : "000000";

    for (let i = 0; i < 4; i += 1) {
      expect(await verifyEmailOtp(email, wrong)).toEqual({ error: "invalid" });
    }
    expect(await verifyEmailOtp(email, wrong)).toEqual({ error: "locked" });
    expect(otpStore[0]?.consumedAt).toBeInstanceOf(Date);

    expect(await verifyEmailOtp(email, first)).toEqual({ error: "invalid" });

    await issueEmailVerification(userId, email);
    const second = codes[1]!;
    expect(await verifyEmailOtp(email, second)).toEqual({ userId });
  });
});
