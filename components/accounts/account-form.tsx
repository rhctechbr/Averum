"use client";

import { useActionState } from "react";
import { saveAccountAction } from "@/lib/actions/accounts";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/form-status";

export function AccountForm({ account }: { account?: { id: string; name: string; type: string; initial_balance: number } }) {
  const [state, action] = useActionState(saveAccountAction, { ok: true });
  return <form action={action} className="space-y-4">{account && <input type="hidden" name="id" value={account.id} />}
    <label className="block text-sm font-medium">Nome<Input name="name" className="mt-2" defaultValue={account?.name} maxLength={80} required /></label>
    <label className="block text-sm font-medium">Tipo<Select name="type" className="mt-2" defaultValue={account?.type ?? "checking"}><option value="checking">Conta corrente</option><option value="savings">Poupança</option><option value="cash">Dinheiro</option></Select></label>
    <label className="block text-sm font-medium">Saldo inicial<Input name="initialBalance" inputMode="decimal" className="mt-2" defaultValue={account ? Number(account.initial_balance).toFixed(2).replace(".", ",") : "0,00"} required /></label>
    {!state.ok && <p role="alert" className="text-sm text-negative">{state.message}</p>}{state.ok && state.data && <p role="status" className="text-sm text-positive">{state.data}</p>}<SubmitButton />
  </form>;
}
