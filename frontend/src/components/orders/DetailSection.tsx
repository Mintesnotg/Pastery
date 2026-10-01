import type { ReactNode } from "react";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A8573]">{title}</h3>
      <div className="rounded-2xl border border-[#E8DDD2] bg-[#FFFBF7] p-4">{children}</div>
    </section>
  );
}
