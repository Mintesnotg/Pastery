import type { Request, Response } from "express";
import path from "node:path";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  adminUpdateBusinessAccount,
  getBusinessAccount,
  getDocumentAbsolutePath,
  getMyBusinessAccount,
  listAdminBusinessAccounts,
  registerBusinessAccount,
} from "./businessAccount.service.js";
import {
  businessAccountAdminUpdateSchema,
  businessAccountRegisterSchema,
} from "./businessAccount.validator.js";
import { toStoredRelativePath } from "./businessAccount.upload.js";

type UploadedFiles = {
  business_id_doc?: Express.Multer.File[];
  license_doc?: Express.Multer.File[];
};

export async function getMyBusinessAccountController(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) return sendError(res, 401, "Unauthenticated");

  try {
    const account = await getMyBusinessAccount(userId);
    if (!account) return res.status(404).json({ error: "No business account", data: null });
    res.json(account);
  } catch (err) {
    sendError(res, 500, "Failed to load business account", (err as Error).message);
  }
}

export async function listBusinessAccountsController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  try {
    res.json(await listAdminBusinessAccounts({ page, pageSize, status, search }));
  } catch (err) {
    sendError(res, 500, "Failed to list business accounts", (err as Error).message);
  }
}

export async function getBusinessAccountController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid business account ID");

  const account = await getBusinessAccount(id);
  if (!account) return sendError(res, 404, "Business account not found");
  res.json(account);
}

export async function registerBusinessAccountController(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) return sendError(res, 401, "Unauthenticated");

  const parsed = businessAccountRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid business account payload", parsed.error.flatten());
  }

  const files = req.files as UploadedFiles | undefined;
  const businessIdFile = files?.business_id_doc?.[0];
  const licenseFile = files?.license_doc?.[0];

  if (!businessIdFile || !licenseFile) {
    return sendError(res, 400, "Both business_id_doc and license_doc files are required");
  }

  try {
    const created = await registerBusinessAccount(userId, {
      ...parsed.data,
      businessIdDocPath: toStoredRelativePath(businessIdFile.path),
      licenseDocPath: toStoredRelativePath(licenseFile.path),
    });
    res.status(201).json(created);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message);
  }
}

export async function updateBusinessAccountController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid business account ID");

  const parsed = businessAccountAdminUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid update payload", parsed.error.flatten());
  }

  try {
    const updated = await adminUpdateBusinessAccount(id, parsed.data);
    if (!updated) return sendError(res, 404, "Business account not found");
    res.json(updated);
  } catch (err) {
    sendError(res, 500, "Failed to update business account", (err as Error).message);
  }
}

export async function downloadDocumentController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid business account ID");

  const kindRaw = String(req.params.kind ?? "");
  const kind = kindRaw === "license" ? "license" : kindRaw === "business-id" ? "business-id" : null;
  if (!kind) return sendError(res, 400, "Invalid document kind (business-id | license)");

  const userId = req.auth?.userId;
  if (!userId) return sendError(res, 401, "Unauthenticated");

  const isAdminViewer = Boolean(req.permissions?.includes("view.business_accounts"));

  const result = await getDocumentAbsolutePath(id, kind, { userId, isAdminViewer });
  if ("error" in result) {
    if (result.error === "not_found") return sendError(res, 404, "Business account not found");
    if (result.error === "forbidden") return sendError(res, 403, "Forbidden");
    return sendError(res, 404, "Document not found");
  }

  const { absolute, filename } = result;
  res.download(absolute, filename || path.basename(absolute));
}
