"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./button";
import type { ActionResult } from "@/types/domain";

type RowActionProps = {
  action: (_: ActionResult<string>, formData: FormData) => Promise<ActionResult<string>>;
  id: string;
  label: string;
  fields?: Record<string, string>;
  destructive?: boolean;
  compact?: boolean;
};

export function RowAction({ action, id, label, fields, destructive, compact }: RowActionProps) {
  const [state, formAction, pending] = useActionState(action, { ok: true } as const);
  return <form action={formAction} onSubmit={(event) => { if (destructive && !window.confirm("Confirma a exclusão?")) event.preventDefault(); }} className="relative">
    <input type="hidden" name="id" value={id} />{Object.entries(fields ?? {}).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
    <Button type="submit" variant="ghost" disabled={pending} className={`${compact ? "h-9 w-9 px-0" : "text-xs"} ${destructive ? "text-negative" : ""}`} aria-label={label}>{destructive && compact ? <Trash2 size={17} /> : pending ? "Aguarde…" : label}</Button>
    {!state.ok && <span role="alert" className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md border bg-surface p-2 text-xs text-negative shadow">{state.message}</span>}
  </form>;
}
