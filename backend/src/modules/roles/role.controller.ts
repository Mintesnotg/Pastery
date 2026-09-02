import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  createNewRole,
  deleteRole,
  getRole,
  getRolesPaginated,
  getRoleWithPermissions,
  updateRole,
} from "./role.service.js";
import { roleSchema, roleUpdateSchema } from "./role.validator.js";

export async function listRolesController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  res.json(await getRolesPaginated({ page, pageSize }));
}

export async function createRoleController(req: Request, res: Response) {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid role payload");
  const created = await createNewRole(parsed.data);
  if (!created) return sendError(res, 409, "Role already exists");
  if ("invalidPermissionIds" in created) return sendError(res, 400, "Invalid permission IDs");
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
  const updated = await updateRole(id, parsed.data);
  if (!updated) return sendError(res, 404, "Role not found");
  if ("invalidPermissionIds" in updated) return sendError(res, 400, "Invalid permission IDs");
  res.json(updated);
}

export async function deleteRoleController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid role ID");
  const deleted = await deleteRole(id);
  if (!deleted) return sendError(res, 404, "Role not found");
  res.json(deleted);
}
