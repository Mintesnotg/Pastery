export const ORDER_SETTING_KEYS = [
  "order.timezone",
  "order.cutoff_time",
  "order.min_lead_days",
] as const;

export type OrderSettingKey = (typeof ORDER_SETTING_KEYS)[number];

export const DEFAULT_ORDER_SETTINGS: Record<OrderSettingKey, string> = {
  "order.timezone": "Europe/London",
  "order.cutoff_time": "14:00",
  "order.min_lead_days": "1",
};

export const PUBLIC_SETTING_KEYS = ORDER_SETTING_KEYS;
