import { users } from "../db/schema.js";
import { createUser, deactivateUserById, findUserByEmail, findUserById, listUsers, updateUserById } from "../repositories/accountUserRepository.js";

export async function getUsers() {
  return listUsers();
}

export async function getUser(id: string) {
  return findUserById(id);
}

export async function createNewUser(input: typeof users.$inferInsert) {
  const existing = await findUserByEmail(input.email);
  if (existing) return null;
  return createUser(input);
}

export async function updateUser(id: string, input: Partial<typeof users.$inferInsert>) {
  return updateUserById(id, input);
}

export async function deleteUser(id: string) {
  return deactivateUserById(id);
}
