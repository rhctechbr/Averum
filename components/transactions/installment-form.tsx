"use client";

import { useActionState, useState } from "react";
import { createInstallmentAction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormMessage } from "@/components/ui/form-status";
import type { Tables } from "@/types/database";

export function InstallmentForm({ accounts, cards, categories }: { accounts: Tables<"accounts">[]; cards: Tables<"cards">[]; categories: Tables<"categories">[] }) {
  const [state, action, pending] = useActionState(createInstallmentAction, { ok: true } as const);
  const [source, setSource] = useState("card");
  return <form action={action} className="space-y-4">
    <Input label="Descrição" name="description" maxLength={200} required />
    <div className="grid grid-cols-2 gap-3"><Input label="Valor total" name="totalAmount" inputMode="decimal" placeholder="0,00" required /><Input label="Parcelas" name="installmentsCount" type="number" min={2} max={60} required /></div>
    <Input label="Data da primeira parcela" name="firstInstallmentDate" type="date" required />
    <Select label="Categoria" name="categoryId" required><option value="">Selecione</option>{categories.filter((item) => item.type === "expense").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
    <div className="flex gap-4 text-sm"><label><input type="radio" checked={source === "account"} onChange={() => setSource("account")} /> Conta</label><label><input type="radio" checked={source === "card"} onChange={() => setSource("card")} /> Cartão</label></div>
    {source === "account" ? <Select label="Conta" name="accountId" required><option value="">Selecione</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select> : <Select label="Cartão" name="cardId" required><option value="">Selecione</option>{cards.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
    <p className="text-xs text-muted">As parcelas serão distribuídas em centavos e manterão o dia original sempre que o mês permitir.</p>
    <FormMessage state={state} /><Button type="submit" disabled={pending}>{pending ? "Criando…" : "Criar parcelamento"}</Button>
  </form>;
}
