import type { ReactNode } from "react";

type InfoRowProps = {
  label: string;
  value: ReactNode;
};

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-1.5 text-sm">
      <span className="text-[#9A8573]">{label}</span>
      <span className="font-medium text-[#3F2A18]">{value}</span>
    </div>
  );
}
