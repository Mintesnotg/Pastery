import { signSession, verifyPassword } from "../../shared/lib/auth.js";
import {
  getUserPermissions,
  getUserRoleIds,
  getUserRoleKeys,
} from "./auth.repository.js";
import { findActiveUserByEmail, updateUserLastLogin } from "../users/user.repository.js";

export async function login(email: string, password: string) {
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
