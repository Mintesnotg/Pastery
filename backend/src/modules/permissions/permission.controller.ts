import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  createNewPermission,
  deletePermission,
  getPermission,
  getPermissions,
  updatePermission,
} from "./permission.service.js";
import { permissionSchema, permissionUpdateSchema } from "./permission.validator.js";

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
