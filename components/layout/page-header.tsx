import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <header className="mb-8 flex items-start justify-between gap-5"><div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div>{action}</header>;
}
