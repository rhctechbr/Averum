"use client";

import { useActionState } from "react";
import { generateSalaryAction } from "@/lib/actions/salary";
import { splitSalary } from "@/lib/finance/salary";
import { formatBRL, formatDateBR } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-status";

export function SalaryGeneration({ monthlyAmount, competence }: { monthlyAmount: number; competence: string }) {
  const [state, action, pending] = useActionState(generateSalaryAction, { ok: true } as const);
  const parts = splitSalary(Math.round(monthlyAmount * 100), competence);
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2">{parts.map((part) => <div key={part.part} className="rounded-md border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted">Entrada {part.part}%</p><p className="mt-2 text-xl font-semibold tabular-nums">{formatBRL(part.amountCents / 100)}</p><p className="text-sm text-muted">{formatDateBR(part.date)}</p></div>)}</div><form action={action} className="space-y-3"><input type="hidden" name="competence" value={competence} /><FormMessage state={state} /><Button type="submit" disabled={pending}>{pending ? "Gerando…" : "Gerar salário do mês"}</Button></form></div>;
}
