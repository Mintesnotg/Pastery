import type { User } from "@prisma/client";
import { prisma } from "../../db/index.js";
import { hashPassword } from "../../shared/lib/auth.js";
import {
  countActiveUsers,
  createUser,
  deactivateUserById,
  findRolesByIds,
  findUserByEmail,
  findUserById,
  findUserRoleIdsBatch,
  listUsers,
  replaceUserRoles,
  updateUserById,
} from "./user.repository.js";

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: number[];
};

export type UpdateUserInput = {
  firstName: string;
  lastName: string;
  email?: string;
  roleIds?: number[];
};

export type UserDTO = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  active: boolean;
  roleIds: number[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

function toUserDTO(user: User, roleIds: number[]): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    active: user.active,
    roleIds,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

function isPasswordComplex(password: string): boolean {
  return /[a-zA-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z\d]/.test(password);
}

export async function getUsers(options: { page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const [userRows, total] = await Promise.all([
    listUsers({ limit: pageSize, offset }),
    countActiveUsers(),
  ]);
  const userIds = userRows.map((u) => u.id);
  const rolesMap = await findUserRoleIdsBatch(userIds);
  const data = userRows.map((u) => toUserDTO(u, rolesMap.get(u.id) ?? []));
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
}

export async function getUser(id: string) {
  return findUserById(id);
}

export async function createNewUser(
  input: CreateUserInput,
): Promise<{ user: UserDTO } | { conflict: true } | { invalidRoleIds: true } | { weakPassword: true } | null> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const roleIds = [...new Set(input.roleIds ?? [])];

  if (!email || !password || !firstName || !lastName) return null;
  if (password.length < 8) return null;
  if (!isPasswordComplex(password)) return { weakPassword: true };

  const existing = await findUserByEmail(email);
  if (existing) return { conflict: true };

  if (roleIds.length > 0) {
    const validRoles = await findRolesByIds(roleIds);
    if (validRoles.length !== roleIds.length) return { invalidRoleIds: true };
  }

  const passwordHash = hashPassword(password);
  const fullName = `${firstName} ${lastName}`.trim();

  const created = await prisma.$transaction(async (tx) => {
    const user = await createUser(
      {
        email,
        passwordHash: passwordHash.hash,
        passwordSalt: passwordHash.salt,
        firstName,
        lastName,
        fullName,
        active: true,
      },
      tx,
    );
    if (!user) return null;
    await replaceUserRoles(user.id, roleIds, tx);
    return { user, roleIds };
  });

  if (!created) return null;
  return { user: toUserDTO(created.user, created.roleIds) };
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserDTO | { invalidRoleIds: true } | null> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();

  const updated = await updateUserById(id, {
    firstName,
    lastName,
    fullName,
    updatedAt: new Date(),
    ...(input.email ? { email: input.email.trim().toLowerCase() } : {}),
  });
  if (!updated) return null;

  if (input.roleIds !== undefined) {
    const uniqueIds = [...new Set(input.roleIds)];
    if (uniqueIds.length > 0) {
      const validRoles = await findRolesByIds(uniqueIds);
      if (validRoles.length !== uniqueIds.length) return { invalidRoleIds: true };
    }
    await replaceUserRoles(id, input.roleIds);
  }

  const rolesMap = await findUserRoleIdsBatch([id]);
  return toUserDTO(updated, rolesMap.get(id) ?? []);
}

export async function deleteUser(id: string) {
  return deactivateUserById(id);
}
