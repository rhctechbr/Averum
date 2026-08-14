import type { ReactNode } from "react";

export function Metric({ label, value, tone = "default", prominent = false, detail }: { label: string; value: string; tone?: "default" | "positive" | "negative"; prominent?: boolean; detail?: ReactNode }) {
  const color = tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground";
  return <section className={prominent ? "border-y py-7 sm:py-9" : "py-4"}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p><p className={`${prominent ? "mt-2 text-4xl sm:text-5xl" : "mt-1 text-2xl"} ${color} font-semibold tabular-nums tracking-tight`}>{value}</p>{detail && <div className="mt-2 text-sm text-muted">{detail}</div>}</section>;
}
