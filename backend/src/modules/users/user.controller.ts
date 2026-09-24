import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readStringId } from "../../shared/utils/requestParams.js";
import {
  createNewUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  type UpdateUserInput,
} from "./user.service.js";
import { userSchema, userUpdateSchema } from "./user.validator.js";

export async function listUsersController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  res.json(await getUsers({ page, pageSize }));
}

export async function createUserController(req: Request, res: Response) {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid user payload");

  // Public registration always gets customer role (id 2); ignore client roleIds.
  const CUSTOMER_ROLE_ID = 2;
  const payload = req.auth
    ? parsed.data
    : { ...parsed.data, roleIds: [CUSTOMER_ROLE_ID] };

  const created = await createNewUser(payload);
  if (!created) return sendError(res, 400, "Invalid user payload");
  if ("weakPassword" in created)
    return sendError(
      res,
      400,
      "Password must contain at least one letter, one number, and one special character",
    );
  if ("conflict" in created) return sendError(res, 409, "User already exists");
  if ("invalidRoleIds" in created) return sendError(res, 400, "Invalid role IDs");
  res.status(201).json(created.user);
}

export async function getUserController(req: Request, res: Response) {
  const id = readStringId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid user ID");
  const user = await getUser(id);
  if (!user) return sendError(res, 404, "User not found");
  res.json(user);
}

export async function updateUserController(req: Request, res: Response) {
  const id = readStringId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid user ID");
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid user payload");
  const updated = await updateUser(id, parsed.data as UpdateUserInput);
  if (!updated) return sendError(res, 404, "User not found");
  if ("invalidRoleIds" in updated) return sendError(res, 400, "Invalid role IDs");
  res.json(updated);
}

export async function deleteUserController(req: Request, res: Response) {
  const id = readStringId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid user ID");
  const deleted = await deleteUser(id);
  if (!deleted) return sendError(res, 404, "User not found");
  res.json(deleted);
}
