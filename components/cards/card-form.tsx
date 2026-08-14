"use client";

import { useActionState } from "react";
import { saveCardAction } from "@/lib/actions/cards";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/form-status";

export function CardForm({ card }: { card?: { id: string; name: string; credit_limit: number; closing_day: number; due_day: number; color: string } }) {
  const [state, action] = useActionState(saveCardAction, { ok: true });
  return <form action={action} className="space-y-4">{card && <input type="hidden" name="id" value={card.id} />}
    <label className="block text-sm font-medium">Nome<Input name="name" className="mt-2" defaultValue={card?.name} maxLength={80} required /></label>
    <label className="block text-sm font-medium">Limite de crédito<Input name="creditLimit" inputMode="decimal" className="mt-2" defaultValue={card ? Number(card.credit_limit).toFixed(2).replace(".", ",") : ""} required /></label>
    <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Fechamento<Input name="closingDay" type="number" min={1} max={28} className="mt-2" defaultValue={card?.closing_day ?? 10} required /></label><label className="block text-sm font-medium">Vencimento<Input name="dueDay" type="number" min={1} max={28} className="mt-2" defaultValue={card?.due_day ?? 20} required /></label></div>
    <label className="block text-sm font-medium">Cor<Input name="color" type="color" className="mt-2 h-11 p-1" defaultValue={card?.color ?? "#185C45"} required /></label>
    {!state.ok && <p role="alert" className="text-sm text-negative">{state.message}</p>}{state.ok && state.data && <p role="status" className="text-sm text-positive">{state.data}</p>}<SubmitButton />
  </form>;
}
