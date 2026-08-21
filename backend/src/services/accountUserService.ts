import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { hashPassword } from "../lib/auth.js";
import { createUser, deactivateUserById, findRolesByIds, findUserByEmail, findUserById, replaceUserRoles, updateUserById } from "../repositories/accountUserRepository.js";

export type CreateUserInput = {
  email: string;
  password: string;
  roleIds?: number[];
  fullName?: string;
};

export type UserDTO = {
  id: string;
  email: string;
  fullName: string;
  active: boolean;
  roleIds: number[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

function toUserDTO(user: typeof users.$inferSelect, roleIds: number[]): UserDTO {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    active: user.active,
    roleIds,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

export async function getUsers() {
  return db.select().from(users).where(eq(users.active, true)).orderBy(desc(users.createdAt));
}

export async function getUser(id: string) {
  return findUserById(id);
}

export async function createNewUser(input: CreateUserInput): Promise<{ user: UserDTO } | { conflict: true } | { invalidRoleIds: true } | null> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const roleIds = [...new Set(input.roleIds ?? [])];
  const fullName = input.fullName?.trim() || email;

  if (!email || !password || password.length < 8) return null;

  const existing = await findUserByEmail(email);
  if (existing) return { conflict: true };

  if (roleIds.length > 0) {
    const validRoles = await findRolesByIds(roleIds);
    if (validRoles.length !== roleIds.length) return { invalidRoleIds: true };
  }

  const passwordHash = hashPassword(password);

  const created = await db.transaction(async (tx) => {
    const user = await createUser(
      {
        email,
        passwordHash: passwordHash.hash,
        passwordSalt: passwordHash.salt,
        fullName,
        active: true,
      },
      tx
    );

    if (!user) return null;

    await replaceUserRoles(user.id, roleIds, tx);
    return { user, roleIds };
  });

  if (!created) return null;
  return { user: toUserDTO(created.user, created.roleIds) };
}

export async function updateUser(id: string, input: Partial<typeof users.$inferInsert>) {
  return updateUserById(id, input);
}

export async function deleteUser(id: string) {
  return deactivateUserById(id);
}
