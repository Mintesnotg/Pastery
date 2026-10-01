import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { prisma } from "../../db/index.js";
import { signSession } from "../../shared/lib/auth.js";
import {
  findActiveUserByEmail,
  findUserByEmail,
  replaceUserRoles,
  updateUserLastLogin,
} from "../users/user.repository.js";
import {
  getUserPermissions,
  getUserRoleIds,
  getUserRoleKeys,
} from "./auth.repository.js";

const googleClient = new OAuth2Client(env.googleClientId);

export async function findCustomerRoleId() {
  const role = await prisma.role.findUnique({ where: { key: "customer" } });
  return role?.id ?? null;
}

export async function buildSessionForUser(userId: string, email: string) {
  const roleIds = await getUserRoleIds(userId);
  const roles = await getUserRoleKeys(userId);
  const permissions = await getUserPermissions(userId);
  await updateUserLastLogin(userId, new Date());
  const token = signSession({ sub: userId, email, roleIds, roles });
  return {
    token,
    roleIds,
    user: { id: userId, email, roles, permissions },
  };
}

export async function loginWithGoogleIdToken(idToken: string) {
  if (!env.googleClientId) {
    return { error: "google_not_configured" as const };
  }

  let payload: {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
    name?: string;
  };
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload() ?? {};
  } catch {
    return { error: "invalid_token" as const };
  }

  const providerAccountId = payload.sub;
  const email = payload.email?.trim().toLowerCase();
  if (!providerAccountId || !email) {
    return { error: "invalid_token" as const };
  }
  if (payload.email_verified === false) {
    return { error: "email_not_verified" as const };
  }

  const firstName = (payload.given_name ?? "").trim() || "Google";
  const lastName = (payload.family_name ?? "").trim() || "User";
  const fullName = (payload.name ?? `${firstName} ${lastName}`).trim();

  const existingOauth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId,
      },
    },
    include: { user: true },
  });

  let user = existingOauth?.user ?? null;

  if (!user) {
    user = await findUserByEmail(email);
  }

  const customerRoleId = await findCustomerRoleId();
  if (!customerRoleId) {
    return { error: "customer_role_missing" as const };
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        fullName,
        active: true,
        emailVerifiedAt: new Date(),
        passwordHash: null,
        passwordSalt: null,
        userRoles: { create: { roleId: customerRoleId } },
        oauthAccounts: {
          create: { provider: "google", providerAccountId },
        },
      },
    });
  } else {
    if (!user.active) {
      return { error: "inactive" as const };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        ...(user.firstName ? {} : { firstName }),
        ...(user.lastName ? {} : { lastName }),
        ...(user.fullName ? {} : { fullName }),
      },
    });

    const roleIds = await getUserRoleIds(user.id);
    if (!roleIds.includes(customerRoleId) && roleIds.length === 0) {
      await replaceUserRoles(user.id, [customerRoleId]);
    }

    await prisma.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId,
        },
      },
      create: {
        userId: user.id,
        provider: "google",
        providerAccountId,
      },
      update: {},
    });
  }

  const session = await buildSessionForUser(user.id, user.email);
  return { session };
}

export async function ensureCustomerRoleId() {
  return findCustomerRoleId();
}
