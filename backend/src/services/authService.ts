import { env } from "../config/env.js";
import { hashPassword, signSession, verifyPassword } from "../lib/auth.js";
import { attachPermissionsToRole, attachRoleToUser, createPermissions, createRole, findPermissionsByKeys, findRoleByKey, getUserPermissions, getUserRoleKeys } from "../repositories/authRepository.js";
import { createUser, findActiveUserByEmail, findUserByEmail, updateUserLastLogin } from "../repositories/userRepository.js";

const bootstrapPermissions = [
  { key: "orders.read", name: "Read orders" },
  { key: "orders.write", name: "Update orders" },
  { key: "orders.delete", name: "Delete orders" },
  { key: "messages.read", name: "Read messages" },
  { key: "messages.delete", name: "Delete messages" },
  { key: "users.manage", name: "Manage users" },
];

export async function ensureBootstrapAdmin() {
  const existing = await findUserByEmail(env.bootstrapEmail);
  if (existing) return existing;

  const { salt, hash } = hashPassword(env.bootstrapPassword);
  const admin = await createUser({
    email: env.bootstrapEmail,
    passwordHash: hash,
    passwordSalt: salt,
    fullName: "Bootstrap Admin",
  });

  let adminRole = await findRoleByKey("admin");
  if (!adminRole) {
    adminRole = await createRole("admin", "Administrator");
  }

  const existingPermissions = await findPermissionsByKeys(bootstrapPermissions.map((permission) => permission.key));
  const missingPermissions = bootstrapPermissions.filter(
    (permission) => !existingPermissions.some((existing) => existing.key === permission.key)
  );
  const createdPermissions = await createPermissions(missingPermissions);
  const allPermissions = [...existingPermissions, ...createdPermissions];

  await attachRoleToUser(admin.id, adminRole.id);
  await attachPermissionsToRole(
    adminRole.id,
    allPermissions.filter((permission) => bootstrapPermissions.some((item) => item.key === permission.key)).map((permission) => permission.id)
  );
  return admin;
}

export async function login(email: string, password: string) {
  await ensureBootstrapAdmin();
  const user = await findActiveUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return null;
  }
  const roles = await getUserRoleKeys(user.id);
  const permissions = await getUserPermissions(user.id);
  await updateUserLastLogin(user.id, new Date());
  const session = signSession({ sub: user.id, email: user.email, roles });
  return {
    session,
    user: { id: user.id, email: user.email, fullName: user.fullName, roles, permissions },
  };
}
