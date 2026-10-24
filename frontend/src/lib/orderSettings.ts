import { apiUrl } from "@/lib/api";

export type PublicOrderSettings = {
  "order.timezone": string;
  "order.cutoff_time": string;
  "order.min_lead_days": string;
};

const defaults: PublicOrderSettings = {
  "order.timezone": "Europe/London",
  "order.cutoff_time": "14:00",
  "order.min_lead_days": "1",
};

/** Earliest YYYY-MM-DD for fulfillment, matching backend cut-off rules. */
export function earliestFulfillmentDate(
  settings: PublicOrderSettings,
  now = new Date(),
): string {
  const timeZone = settings["order.timezone"] || defaults["order.timezone"];
  const cutoff = settings["order.cutoff_time"] || defaults["order.cutoff_time"];
  const leadDays = Number(settings["order.min_lead_days"] ?? 1);

  const ymdParts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const hmParts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  const y = get(ymdParts, "year");
  const m = get(ymdParts, "month");
  const d = get(ymdParts, "day");
  const h = get(hmParts, "hour");
  const min = get(hmParts, "minute");
  const [ch, cm] = cutoff.split(":").map(Number);
  const pastCutoff = h > ch || (h === ch && min >= cm);
  const lead = (Number.isFinite(leadDays) ? leadDays : 1) + (pastCutoff ? 1 : 0);

  const dt = new Date(Date.UTC(y, m - 1, d + lead));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export async function fetchPublicOrderSettings(): Promise<PublicOrderSettings> {
  try {
    const res = await fetch(apiUrl("/api/settings/public"), { credentials: "include" });
    if (!res.ok) return defaults;
    const data = (await res.json()) as Partial<PublicOrderSettings>;
    return { ...defaults, ...data };
  } catch {
    return defaults;
  }
}
