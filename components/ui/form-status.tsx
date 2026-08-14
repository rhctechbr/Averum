"use client";

import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/types/domain";
import { Button } from "./button";

export function SubmitButton({ label = "Salvar" }: { label?: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Salvando…" : label}</Button>;
}

export function FormMessage({ state }: { state: ActionResult<unknown> }) {
  if (state.ok) return state.data ? <p role="status" className="rounded-md bg-positive/10 px-3 py-2 text-sm text-positive">{String(state.data)}</p> : null;
  return <p role="alert" className="rounded-md bg-negative/10 px-3 py-2 text-sm text-negative">{state.message}</p>;
}
