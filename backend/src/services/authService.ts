import { env } from "../config/env.js";
import { hashPassword, signSession, verifyPassword } from "../lib/auth.js";
import { attachPermissionsToRole, attachRoleToUser, createPermissions, createRole, findPermissionsByKeys, findRoleByKey, getUserPermissions, getUserRoleIds, getUserRoleKeys } from "../repositories/authRepository.js";
import { createUser, findActiveUserByEmail, findUserByEmail, updateUserLastLogin } from "../repositories/userRepository.js";

const bootstrapPermissions = [
  { key: "orders.read", name: "Read orders" },
  { key: "orders.write", name: "Update orders" },
  { key: "orders.delete", name: "Delete orders" },
  { key: "messages.read", name: "Read messages" },
  { key: "messages.delete", name: "Delete messages" },
  { key: "users.manage", name: "Manage users" },
];



export async function login(email: string, password: string) {
  // await ensureBootstrapAdmin();
  const user = await findActiveUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return null;
  }
  const roleIds = await getUserRoleIds(user.id);
  const roles = await getUserRoleKeys(user.id);
  const permissions = await getUserPermissions(user.id);
  await updateUserLastLogin(user.id, new Date());
  
  const token = signSession({ sub: user.id, email: user.email, roleIds, roles });
  return {
    token,
    roleIds,
    user: { id: user.id, email: user.email, fullName: user.fullName, roles, permissions },
  };
}
