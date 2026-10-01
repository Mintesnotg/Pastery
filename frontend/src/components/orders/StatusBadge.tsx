import { Check, Clock3, X } from "lucide-react";
import { toStatusGroup, type OrderStatusGroup } from "@/lib/orders";

const STYLES: Record<
  OrderStatusGroup,
  { label: string; badge: string; iconWrap: string; Icon: typeof Check }
> = {
  delivered: {
    label: "Delivered",
    badge: "bg-emerald-50 text-emerald-800",
    iconWrap: "bg-emerald-500 text-white",
    Icon: Check,
  },
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-900",
    iconWrap: "border-2 border-amber-400 bg-[#2A2118] text-amber-300",
    Icon: Clock3,
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-rose-50 text-rose-800",
    iconWrap: "border-2 border-rose-400 bg-white text-rose-600",
    Icon: X,
  },
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const group = toStatusGroup(status);
  const { label, badge, Icon } = STYLES[group];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge} ${className}`}
    >
      <Icon size={12} aria-hidden />
      {label}
    </span>
  );
}

type TimelineDotProps = {
  status: string;
};

export function TimelineDot({ status }: TimelineDotProps) {
  const group = toStatusGroup(status);
  const { iconWrap, Icon } = STYLES[group];
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${iconWrap}`}
      aria-hidden
    >
      <Icon size={14} strokeWidth={2.5} />
    </span>
  );
}
