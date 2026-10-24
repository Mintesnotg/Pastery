import {
  DEFAULT_ORDER_SETTINGS,
  ORDER_SETTING_KEYS,
  PUBLIC_SETTING_KEYS,
  type OrderSettingKey,
} from "./setting.keys.js";
import { listAllSettings, listSettingsByKeys, upsertSettings } from "./setting.repository.js";

function toMap(rows: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function withDefaults(partial: Record<string, string>): Record<OrderSettingKey, string> {
  const out = { ...DEFAULT_ORDER_SETTINGS };
  for (const key of ORDER_SETTING_KEYS) {
    if (partial[key] != null && partial[key] !== "") out[key] = partial[key];
  }
  return out;
}

export async function getPublicSettings() {
  const rows = await listSettingsByKeys([...PUBLIC_SETTING_KEYS]);
  return withDefaults(toMap(rows));
}

export async function getAdminSettings() {
  const rows = await listAllSettings();
  return withDefaults(toMap(rows));
}

export async function updateSettings(input: Partial<Record<OrderSettingKey, string>>) {
  const entries = ORDER_SETTING_KEYS.filter((key) => input[key] !== undefined).map((key) => ({
    key,
    value: String(input[key]),
  }));
  await upsertSettings(entries);
  return getAdminSettings();
}

export type OrderWindowSettings = {
  timezone: string;
  cutoffTime: string;
  minLeadDays: number;
};

export async function getOrderWindowSettings(): Promise<OrderWindowSettings> {
  const settings = await getPublicSettings();
  const lead = Number(settings["order.min_lead_days"]);
  return {
    timezone: settings["order.timezone"] || DEFAULT_ORDER_SETTINGS["order.timezone"],
    cutoffTime: settings["order.cutoff_time"] || DEFAULT_ORDER_SETTINGS["order.cutoff_time"],
    minLeadDays: Number.isFinite(lead) ? lead : 1,
  };
}

/** Calendar YYYY-MM-DD parts in a timezone. */
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

function zonedHm(date: Date, timeZone: string): { h: number; min: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { h: get("hour"), min: get("minute") };
}

function parseYmd(ymd: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function ymdToOrdinal(y: number, m: number, d: number): number {
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

function addDaysYmd(y: number, m: number, d: number, days: number): string {
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function earliestFulfillmentDate(
  now: Date,
  settings: OrderWindowSettings,
): string {
  const { y, m, d } = zonedYmd(now, settings.timezone);
  const { h, min } = zonedHm(now, settings.timezone);
  const [ch, cm] = settings.cutoffTime.split(":").map(Number);
  const pastCutoff = h > ch || (h === ch && min >= cm);
  const lead = settings.minLeadDays + (pastCutoff ? 1 : 0);
  return addDaysYmd(y, m, d, lead);
}

/**
 * Reject pickupDate before the earliest allowed London (or configured TZ) date.
 */
export async function assertFulfillmentWindow(pickupDate: string, now = new Date()) {
  const settings = await getOrderWindowSettings();
  const parsed = parseYmd(pickupDate);
  if (!parsed) {
    const err = new Error("pickupDate must be YYYY-MM-DD");
    (err as Error & { status?: number }).status = 400;
    throw err;
  }

  const earliest = earliestFulfillmentDate(now, settings);
  const earliestParts = parseYmd(earliest)!;
  if (ymdToOrdinal(parsed.y, parsed.m, parsed.d) < ymdToOrdinal(earliestParts.y, earliestParts.m, earliestParts.d)) {
    const err = new Error(
      `Pickup date is too soon. Earliest available is ${earliest} (${settings.timezone}, cut-off ${settings.cutoffTime}).`,
    );
    (err as Error & { status?: number }).status = 400;
    throw err;
  }

  return { earliest, settings };
}
