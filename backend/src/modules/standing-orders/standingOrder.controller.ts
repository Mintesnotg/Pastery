import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  createMyStandingOrder,
  deactivateMyStandingOrder,
  generateStandingOrdersForDate,
  listMyStandingOrders,
  listStandingOrdersAdmin,
  updateMyStandingOrder,
} from "./standingOrder.service.js";
import {
  createStandingOrderSchema,
  generateStandingOrdersSchema,
  updateStandingOrderSchema,
} from "./standingOrder.validator.js";

function requestedPermission(req: Request) {
  return (req.get("X-Permission") ?? req.get("Permission"))?.trim() ?? "";
}

function isAdminManage(req: Request) {
  return requestedPermission(req) === "manage.standing_orders";
}

export async function listStandingOrdersController(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) return sendError(res, 401, "Unauthenticated");

  try {
    if (isAdminManage(req)) {
      const businessAccountId = req.query.businessAccountId
        ? Number(req.query.businessAccountId)
        : undefined;
      const filter =
        businessAccountId != null && Number.isInteger(businessAccountId)
          ? businessAccountId
          : undefined;
      return res.json(await listStandingOrdersAdmin(filter));
    }
    return res.json(await listMyStandingOrders(userId));
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message);
  }
}

export async function createStandingOrderController(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) return sendError(res, 401, "Unauthenticated");

  const parsed = createStandingOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid standing order payload", parsed.error.flatten());
  }

  try {
    const created = await createMyStandingOrder(userId, parsed.data);
    res.status(201).json(created);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message);
  }
}

export async function updateStandingOrderController(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) return sendError(res, 401, "Unauthenticated");

  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid standing order ID");

  const parsed = updateStandingOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid standing order payload", parsed.error.flatten());
  }

  try {
    const updated = await updateMyStandingOrder(userId, id, parsed.data, isAdminManage(req));
    if (!updated) return sendError(res, 404, "Standing order not found");
    res.json(updated);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message);
  }
}

export async function deleteStandingOrderController(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) return sendError(res, 401, "Unauthenticated");

  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid standing order ID");

  try {
    const updated = await deactivateMyStandingOrder(userId, id, isAdminManage(req));
    if (!updated) return sendError(res, 404, "Standing order not found");
    res.json(updated);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message);
  }
}

export async function generateStandingOrdersController(req: Request, res: Response) {
  const parsed = generateStandingOrdersSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, 400, "Invalid generate payload", parsed.error.flatten());
  }

  try {
    res.json(await generateStandingOrdersForDate(parsed.data.date));
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message);
  }
}
