import type { Request, Response } from "express";
import { z } from "zod";
import { sendError } from "../utils/response.js";
import { createNewPermission, deletePermission, getPermission, getPermissions, updatePermission } from "../services/permissionService.js";
import { createNewRole, deleteRole, getRole, getRolePermissionOptions, getRoleWithPermissions, getRoles, updateRole } from "../services/roleService.js";
import { createNewUser, deleteUser, getUser, getUsers, updateUser, type UpdateUserInput } from "../services/accountUserService.js";

const userSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^a-zA-Z\d]/, "Password must contain at least one special character"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleIds: z.array(z.number().int().positive()).optional(),
});

// Separate update schema — no password, firstName/lastName always required
const userUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  roleIds: z.array(z.number().int().positive()).optional(),
});

const permissionSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

const roleSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  permissionIds: z.array(z.number().int().positive()).optional(),
});

const permissionUpdateSchema = permissionSchema.partial();
const roleUpdateSchema = roleSchema.partial();

const readNumericId = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const readStringId = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
};

export async function listUsersController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  res.json(await getUsers({ page, pageSize }));
}
export async function createUserController(req: Request, res: Response) {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid user payload");
  const created = await createNewUser(parsed.data);
  if (!created) return sendError(res, 400, "Invalid user payload");
  if ("weakPassword" in created) return sendError(res, 400, "Password must contain at least one letter, one number, and one special character");
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

export async function listPermissionsController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  res.json(await getPermissions({ page, pageSize }));
}
export async function createPermissionController(req: Request, res: Response) {
  const parsed = permissionSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid permission payload");
  const created = await createNewPermission(parsed.data as any);
  if (!created) return sendError(res, 409, "Permission already exists");
  res.status(201).json(created);
}
export async function getPermissionController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid permission ID");
  const permission = await getPermission(id);
  if (!permission) return sendError(res, 404, "Permission not found");
  res.json(permission);
}
export async function updatePermissionController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid permission ID");
  const parsed = permissionUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid permission payload");
  const updated = await updatePermission(id, parsed.data as any);
  if (!updated) return sendError(res, 404, "Permission not found");
  res.json(updated);
}
export async function deletePermissionController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid permission ID");
  const deleted = await deletePermission(id);
  if (!deleted) return sendError(res, 404, "Permission not found");
  res.json(deleted);
}

export async function listRolesController(_req: Request, res: Response) { res.json(await getRoles()); }
export async function createRoleController(req: Request, res: Response) {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid role payload");
  const created = await createNewRole(parsed.data as any);
  if (!created) return sendError(res, 409, "Role already exists");
  res.status(201).json(created);
}
export async function getRoleController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid role ID");
  const role = await getRole(id);
  if (!role) return sendError(res, 404, "Role not found");
  res.json(role);
}
export async function getRolePermissionsController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid role ID");
  const role = await getRoleWithPermissions(id);
  if (!role) return sendError(res, 404, "Role not found");
  res.json(role);
}
export async function updateRoleController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid role ID");
  const parsed = roleUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid role payload");
  const updated = await updateRole(id, parsed.data as any);
  if (!updated) return sendError(res, 404, "Role not found");
  res.json(updated);
}
export async function deleteRoleController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid role ID");
  const deleted = await deleteRole(id);
  if (!deleted) return sendError(res, 404, "Role not found");
  res.json(deleted);
}
