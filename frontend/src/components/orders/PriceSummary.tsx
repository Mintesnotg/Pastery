import { formatMoney } from "@/lib/orders";

type PriceSummaryProps = {
  subtotal: number;
  total: string | number;
};

export function PriceSummary({ subtotal, total }: PriceSummaryProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between text-[#6B5648]">
        <span>Subtotal</span>
        <span>{formatMoney(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-[#E8DDD2] pt-2 text-base font-semibold text-[#3F2A18]">
        <span>Total</span>
        <span>{formatMoney(total)}</span>
      </div>
    </div>
  );
}
