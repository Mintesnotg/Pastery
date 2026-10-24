import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  downgradeToTier0,
  listTasks,
  processCollections,
  resolveTask,
} from "./collection.service.js";
import {
  downgradeAccountSchema,
  processCollectionsSchema,
  resolveCollectionTaskSchema,
} from "./collection.validator.js";

export async function processCollectionsController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const parsed = processCollectionsSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, 400, "Invalid process payload", parsed.error.flatten());
  }

  try {
    res.json(await processCollections(parsed.data.date));
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to process collections");
  }
}

export async function listTasksController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  try {
    const statusRaw = typeof req.query.status === "string" ? req.query.status : undefined;
    const status =
      statusRaw === "open" || statusRaw === "resolved" || statusRaw === "cancelled"
        ? statusRaw
        : undefined;
    const businessAccountId = req.query.business_account_id
      ? Number(req.query.business_account_id)
      : undefined;

    res.json(
      await listTasks({
        status,
        businessAccountId:
          businessAccountId != null && Number.isInteger(businessAccountId)
            ? businessAccountId
            : undefined,
      }),
    );
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to list collection tasks");
  }
}

export async function resolveTaskController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid task ID");

  const parsed = resolveCollectionTaskSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, 400, "Invalid resolve payload", parsed.error.flatten());
  }

  try {
    const updated = await resolveTask(id, req.auth.userId, parsed.data.notes);
    if (!updated) return sendError(res, 404, "Collection task not found");
    res.json({ success: true, task: updated });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to resolve task");
  }
}

export async function downgradeController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const parsed = downgradeAccountSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, 400, "Invalid downgrade payload", parsed.error.flatten());
  }

  try {
    const updated = await downgradeToTier0({
      businessAccountId: parsed.data.business_account_id,
      force: parsed.data.force,
      notes: parsed.data.notes,
    });
    if (!updated) return sendError(res, 404, "Business account not found");
    res.json({ success: true, account: updated });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to downgrade account");
  }
}
