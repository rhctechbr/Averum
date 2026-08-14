"use server";

import { revalidatePath } from "next/cache";
import { accountSchema } from "@/lib/validators/accounts";
import { uuidSchema } from "@/lib/validators/common";
import { parseMoneyToCents } from "@/lib/finance/money";
import { requireUser } from "./context";
import { databaseError, validationError } from "@/lib/utils/result";
import type { ActionResult } from "@/types/domain";

export async function saveAccountAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = accountSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return validationError(parsed.error);
  const context = await requireUser();
  if (!context) return { ok: false, message: "Sua sessão expirou." };
  const payload = { name: parsed.data.name, type: parsed.data.type, initial_balance: parseMoneyToCents(parsed.data.initialBalance) / 100, user_id: context.user.id };
  const result = parsed.data.id
    ? await context.supabase.from("accounts").update(payload).eq("id", parsed.data.id)
    : await context.supabase.from("accounts").insert(payload);
  if (result.error) return databaseError("salvar conta", result.error.code);
  revalidatePath("/contas"); revalidatePath("/dashboard");
  return { ok: true, data: "Conta salva com sucesso." };
}

export async function deleteAccountAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = uuidSchema.safeParse(formData.get("id"));
  if (!parsed.success) return { ok: false, message: "Conta inválida." };
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { error } = await context.supabase.from("accounts").delete().eq("id", parsed.data);
  if (error) return databaseError("excluir conta", error.code);
  revalidatePath("/contas"); revalidatePath("/dashboard");
  return { ok: true, data: "Conta excluída." };
}
