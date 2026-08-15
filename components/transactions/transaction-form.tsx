"use client";

import { useActionState, useState } from "react";
import { saveTransactionAction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormMessage } from "@/components/ui/form-status";
import type { Tables } from "@/types/database";

type Props = { accounts: Tables<"accounts">[]; cards: Tables<"cards">[]; categories: Tables<"categories">[]; transaction?: Tables<"transactions"> };

export function TransactionForm({ accounts, cards, categories, transaction }: Props) {
  const [state, action, pending] = useActionState(saveTransactionAction, { ok: true } as const);
  const [kind, setKind] = useState(transaction?.kind ?? "expense");
  const [source, setSource] = useState(transaction?.card_id ? "card" : "account");
  const categoriesForKind = categories.filter((category) => category.type === kind);
  const fieldError = (field: string) => state.ok ? undefined : state.fieldErrors?.[field]?.[0];

  return <form action={action} className="space-y-4" noValidate>
    <input type="hidden" name="id" value={transaction?.id ?? ""} />
    <input type="hidden" name="source" value={source} />
    <Select label="Tipo" name="kind" value={kind} onChange={(event) => setKind(event.target.value)} error={fieldError("kind")} required>
      <option value="expense">Despesa</option><option value="income">Receita</option><option value="transfer">Transferência</option>
    </Select>
    <div className="grid grid-cols-2 gap-3">
      <Input label="Valor" name="amount" inputMode="decimal" placeholder="0,00" defaultValue={transaction?.amount?.toFixed(2).replace(".", ",")} error={fieldError("amount")} required />
      <Input label="Data" name="transactionDate" type="date" defaultValue={transaction?.transaction_date ?? new Date().toISOString().slice(0, 10)} error={fieldError("transactionDate")} required />
    </div>
    <Input label="Descrição" name="description" maxLength={220} defaultValue={transaction?.description ?? (kind === "transfer" ? "Transferência" : "")} error={fieldError("description")} required={kind !== "transfer"} />
    {kind !== "transfer" && <Select key={kind} label="Categoria" name="categoryId" defaultValue={transaction?.category_id ?? ""} error={fieldError("categoryId")} required><option value="">Selecione</option>{categoriesForKind.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
    {kind === "income" && <Select label="Conta de entrada" name="accountId" defaultValue={transaction?.account_id ?? ""} error={fieldError("accountId")} required><option value="">Selecione</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
    {kind === "expense" && <>
      <fieldset><legend className="sr-only">Origem da despesa</legend><div className="flex gap-4 text-sm"><label className="flex items-center gap-1"><input type="radio" checked={source === "account"} onChange={() => setSource("account")} /> Conta</label><label className="flex items-center gap-1"><input type="radio" checked={source === "card"} onChange={() => setSource("card")} /> Cartão</label></div></fieldset>
      {source === "account" ? <Select label="Conta" name="accountId" defaultValue={transaction?.account_id ?? ""} error={fieldError("accountId")} required><option value="">Selecione</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select> : <Select label="Cartão" name="cardId" defaultValue={transaction?.card_id ?? ""} error={fieldError("cardId")} required><option value="">Selecione</option>{cards.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
      {source === "account" && <Input label="Vencimento (obrigatório se pendente)" name="dueDate" type="date" defaultValue={transaction?.due_date ?? ""} error={fieldError("dueDate")} />}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPaid" defaultChecked={transaction?.is_paid} /> Já foi pago</label>
    </>}
    {kind === "income" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPaid" defaultChecked={transaction?.is_paid} /> Já foi recebido</label>}
    {kind === "transfer" && <div className="grid gap-3 sm:grid-cols-2"><Select label="Conta de origem" name="transferFromAccountId" defaultValue={transaction?.transfer_from_account_id ?? ""} error={fieldError("transferFromAccountId")} required><option value="">Selecione</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select label="Conta de destino" name="transferToAccountId" defaultValue={transaction?.transfer_to_account_id ?? ""} error={fieldError("transferToAccountId")} required><option value="">Selecione</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></div>}
    <FormMessage state={state} />
    <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar lançamento"}</Button>
  </form>;
}
