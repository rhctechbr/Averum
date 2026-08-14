"use client";

import { useActionState } from "react";
import { saveSalarySettingAction } from "@/lib/actions/salary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormMessage } from "@/components/ui/form-status";
import type { Tables } from "@/types/database";

export function SalarySettingForm({ accounts, setting }: { accounts: Tables<"accounts">[]; setting: Tables<"salary_settings"> | null }) {
  const [state, action, pending] = useActionState(saveSalarySettingAction, { ok: true } as const);
  return <form action={action} className="space-y-4"><Input label="Salário mensal" name="monthlyAmount" inputMode="decimal" placeholder="0,00" defaultValue={setting?.monthly_amount.toFixed(2).replace(".", ",")} required /><Select label="Conta de recebimento" name="accountId" defaultValue={setting?.account_id ?? ""} required><option value="">Selecione</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select><p className="text-xs text-muted">O valor será dividido em 40% no dia 15 e 60% no dia 30.</p><FormMessage state={state} /><Button type="submit" disabled={pending || !accounts.length}>{pending ? "Salvando…" : "Salvar configuração"}</Button></form>;
}
