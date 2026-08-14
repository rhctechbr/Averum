"use client";

import { useActionState } from "react";
import { saveCategoryAction } from "@/lib/actions/categories";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/form-status";

export function CategoryForm({ category }: { category?: { id: string; name: string; type: string } }) {
  const [state, action] = useActionState(saveCategoryAction, { ok: true });
  return <form action={action} className="space-y-4">{category && <input type="hidden" name="id" value={category.id} />}
    <label className="block text-sm font-medium">Nome<Input name="name" className="mt-2" defaultValue={category?.name} maxLength={80} required /></label>
    <label className="block text-sm font-medium">Tipo<Select name="type" className="mt-2" defaultValue={category?.type ?? "expense"}><option value="expense">Despesa</option><option value="income">Receita</option></Select></label>
    {!state.ok && <p role="alert" className="text-sm text-negative">{state.message}</p>}{state.ok && state.data && <p role="status" className="text-sm text-positive">{state.data}</p>}<SubmitButton />
  </form>;
}
