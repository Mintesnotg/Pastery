import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  generateWeeklyInvoices,
  getInvoiceForUser,
  listInvoicesAdmin,
  listMyInvoices,
  recordInvoicePayment,
  voidInvoice,
} from "./invoice.service.js";
import {
  generateInvoicesSchema,
  recordInvoicePaymentSchema,
} from "./invoice.validator.js";

function requestedPermission(req: Request) {
  return (req.get("X-Permission") ?? req.get("Permission"))?.trim() ?? "";
}

function canAdminListAll(req: Request) {
  const perms = req.permissions ?? [];
  return (
    perms.includes("create.invoice") ||
    perms.includes("view.business_accounts") ||
    requestedPermission(req) === "create.invoice"
  );
}

export async function generateInvoicesController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const parsed = generateInvoicesSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, 400, "Invalid generate payload", parsed.error.flatten());
  }

  try {
    const result = await generateWeeklyInvoices({
      weekStart: parsed.data.week_start,
      businessAccountId: parsed.data.business_account_id,
      createdByUserId: req.auth.userId,
    });
    res.json(result);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to generate invoices");
  }
}

export async function listInvoicesController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  if (!canAdminListAll(req)) {
    return sendError(res, 403, "Forbidden: admin invoice list requires create.invoice");
  }

  try {
    const businessAccountId = req.query.business_account_id
      ? Number(req.query.business_account_id)
      : undefined;
    const statusRaw = typeof req.query.status === "string" ? req.query.status : undefined;
    const status =
      statusRaw === "open" || statusRaw === "paid" || statusRaw === "void"
        ? statusRaw
        : undefined;

    const rows = await listInvoicesAdmin({
      businessAccountId:
        businessAccountId != null && Number.isInteger(businessAccountId)
          ? businessAccountId
          : undefined,
      status,
    });
    res.json(rows);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to list invoices");
  }
}

export async function listMyInvoicesController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  try {
    res.json(await listMyInvoices(req.auth.userId));
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to list invoices");
  }
}

export async function getInvoiceController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid invoice ID");

  const isAdmin = canAdminListAll(req) || (req.permissions?.includes("create.invoice") ?? false);

  try {
    const invoice = await getInvoiceForUser(id, {
      userId: req.auth.userId,
      isAdmin,
    });
    if (!invoice) return sendError(res, 404, "Invoice not found");
    res.json(invoice);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to fetch invoice");
  }
}

export async function recordPaymentController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid invoice ID");

  const parsed = recordInvoicePaymentSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, 400, "Invalid payment payload", parsed.error.flatten());
  }

  try {
    const updated = await recordInvoicePayment(id, {
      amount: parsed.data.amount,
      reference: parsed.data.reference,
      method: parsed.data.method,
      recordedByUserId: req.auth.userId,
    });
    if (!updated) return sendError(res, 404, "Invoice not found");
    res.json({ success: true, invoice: updated });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to record payment");
  }
}

export async function voidInvoiceController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid invoice ID");

  try {
    const updated = await voidInvoice(id);
    if (!updated) return sendError(res, 404, "Invoice not found");
    res.json({ success: true, invoice: updated });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to void invoice");
  }
}
