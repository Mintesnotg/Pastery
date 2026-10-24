import { prisma } from "../../db/index.js";
import { findBusinessAccountByUserId } from "../business-accounts/businessAccount.repository.js";
import { placeOrder } from "../orders/order.service.js";
import { getOrderWindowSettings } from "../settings/setting.service.js";
import { toStandingOrderDto } from "./standingOrder.mapper.js";
import {
  createStandingOrder,
  deactivateStandingOrder,
  findOrderByStandingAndDate,
  findStandingOrderById,
  listActiveStandingOrdersForGenerate,
  listAllStandingOrders,
  listStandingOrdersByUser,
  updateStandingOrder,
} from "./standingOrder.repository.js";

function httpError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

function asWeekdays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
}

function zonedYmd(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

function formatYmd(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** ISO weekday 1=Mon … 7=Sun from YYYY-MM-DD (calendar date, UTC). */
export function isoWeekdayFromYmd(ymd: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) throw httpError(400, "Invalid date");
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dow = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  return dow === 0 ? 7 : dow;
}

async function todayInConfiguredTz(): Promise<string> {
  const settings = await getOrderWindowSettings();
  const { y, m, d } = zonedYmd(new Date(), settings.timezone);
  return formatYmd(y, m, d);
}

async function requireApprovedBusinessAccount(userId: string) {
  const account = await findBusinessAccountByUserId(userId);
  if (!account || account.approvalStatus !== "approved") {
    throw httpError(403, "Approved business account required for standing orders");
  }
  return account;
}

async function assertProductsHaveWholesale(productIds: number[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  if (products.length !== productIds.length) {
    throw httpError(400, "One or more products were not found or are inactive");
  }
  for (const p of products) {
    if (p.wholesalePrice == null) {
      throw httpError(400, `Product "${p.name}" has no wholesale price`);
    }
  }
}

export async function listMyStandingOrders(userId: string) {
  const rows = await listStandingOrdersByUser(userId);
  return rows.map(toStandingOrderDto);
}

export async function listStandingOrdersAdmin(businessAccountId?: number) {
  const rows = await listAllStandingOrders(businessAccountId);
  return rows.map(toStandingOrderDto);
}

export async function createMyStandingOrder(
  userId: string,
  input: {
    weekdays: number[];
    fulfillment_type: "pickup" | "delivery";
    delivery_address?: string | null;
    preferred_time: string;
    notes?: string | null;
    items: { product_id: number; quantity: number }[];
  },
) {
  const account = await requireApprovedBusinessAccount(userId);
  const productIds = [...new Set(input.items.map((i) => i.product_id))];
  await assertProductsHaveWholesale(productIds);

  const weekdays = [...new Set(input.weekdays)].sort((a, b) => a - b);
  const fulfillmentType = input.fulfillment_type;
  const deliveryAddress =
    fulfillmentType === "delivery" ? (input.delivery_address?.trim() || null) : null;

  const row = await createStandingOrder({
    businessAccountId: account.id,
    userId,
    weekdays,
    fulfillmentType,
    deliveryAddress,
    preferredTime: input.preferred_time.trim(),
    notes: input.notes?.trim() || null,
    items: input.items.map((i) => ({ productId: i.product_id, quantity: i.quantity })),
  });
  return toStandingOrderDto(row);
}

export async function updateMyStandingOrder(
  userId: string,
  id: number,
  input: {
    weekdays?: number[];
    fulfillment_type?: "pickup" | "delivery";
    delivery_address?: string | null;
    preferred_time?: string;
    notes?: string | null;
    active?: boolean;
    items?: { product_id: number; quantity: number }[];
  },
  asAdmin = false,
) {
  const existing = await findStandingOrderById(id);
  if (!existing) return null;
  if (!asAdmin && existing.userId !== userId) {
    throw httpError(403, "Forbidden");
  }
  if (!asAdmin) {
    await requireApprovedBusinessAccount(userId);
  }

  if (input.items) {
    const productIds = [...new Set(input.items.map((i) => i.product_id))];
    await assertProductsHaveWholesale(productIds);
  }

  const fulfillmentType = input.fulfillment_type ?? existing.fulfillmentType;
  let deliveryAddress =
    input.delivery_address !== undefined
      ? input.delivery_address?.trim() || null
      : existing.deliveryAddress;
  if (fulfillmentType === "delivery" && !deliveryAddress?.trim()) {
    throw httpError(400, "delivery_address is required for delivery");
  }
  if (fulfillmentType === "pickup") deliveryAddress = null;

  const row = await updateStandingOrder(id, {
    weekdays: input.weekdays ? [...new Set(input.weekdays)].sort((a, b) => a - b) : undefined,
    fulfillmentType: input.fulfillment_type,
    deliveryAddress: input.delivery_address !== undefined || input.fulfillment_type ? deliveryAddress : undefined,
    preferredTime: input.preferred_time?.trim(),
    notes: input.notes !== undefined ? input.notes?.trim() || null : undefined,
    active: input.active,
    items: input.items?.map((i) => ({ productId: i.product_id, quantity: i.quantity })),
  });
  return toStandingOrderDto(row);
}

export async function deactivateMyStandingOrder(userId: string, id: number, asAdmin = false) {
  const existing = await findStandingOrderById(id);
  if (!existing) return null;
  if (!asAdmin && existing.userId !== userId) {
    throw httpError(403, "Forbidden");
  }
  const row = await deactivateStandingOrder(id);
  return toStandingOrderDto(row);
}

export async function generateStandingOrdersForDate(dateInput?: string) {
  const targetDate = dateInput?.trim() || (await todayInConfiguredTz());
  const weekday = isoWeekdayFromYmd(targetDate);
  const templates = await listActiveStandingOrdersForGenerate();

  const created: { standing_order_id: number; order_id: number }[] = [];
  const skipped: { standing_order_id: number; reason: string }[] = [];

  for (const template of templates) {
    const days = asWeekdays(template.weekdays);
    if (!days.includes(weekday)) continue;

    const existing = await findOrderByStandingAndDate(template.id, targetDate);
    if (existing) {
      skipped.push({
        standing_order_id: template.id,
        reason: "Order already exists for this date",
      });
      continue;
    }

    if (!template.items.length) {
      skipped.push({ standing_order_id: template.id, reason: "No items on standing order" });
      continue;
    }

    try {
      const result = await placeOrder(
        {
          customerName: template.user.fullName || template.businessAccount.businessName,
          email: template.user.email,
          phone: template.businessAccount.phone,
          pickupDate: targetDate,
          pickupTime: template.preferredTime,
          notes: template.notes
            ? `[Standing #${template.id}] ${template.notes}`
            : `Standing order #${template.id}`,
          channel: "wholesale",
          fulfillmentType: template.fulfillmentType,
          deliveryAddress: template.deliveryAddress,
          items: template.items.map((item) => ({
            id: item.productId,
            qty: item.quantity,
          })),
          standingOrderId: template.id,
        },
        template.userId,
      );
      created.push({ standing_order_id: template.id, order_id: result.order.id });
    } catch (err) {
      skipped.push({
        standing_order_id: template.id,
        reason: (err as Error).message || "Failed to create order",
      });
    }
  }

  return {
    date: targetDate,
    weekday,
    created,
    skipped,
    created_count: created.length,
    skipped_count: skipped.length,
  };
}
