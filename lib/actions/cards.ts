"use server";

import { revalidatePath } from "next/cache";
import { cardSchema } from "@/lib/validators/cards";
import { uuidSchema } from "@/lib/validators/common";
import { parseMoneyToCents } from "@/lib/finance/money";
import { requireUser } from "./context";
import { databaseError, validationError } from "@/lib/utils/result";
import type { ActionResult } from "@/types/domain";

export async function saveCardAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = cardSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return validationError(parsed.error);
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const payload = { name: parsed.data.name, credit_limit: parseMoneyToCents(parsed.data.creditLimit) / 100, closing_day: parsed.data.closingDay, due_day: parsed.data.dueDay, color: parsed.data.color, user_id: context.user.id };
  const result = parsed.data.id ? await context.supabase.from("cards").update(payload).eq("id", parsed.data.id) : await context.supabase.from("cards").insert(payload);
  if (result.error) return databaseError("salvar cartão", result.error.code);
  revalidatePath("/cartoes"); return { ok: true, data: "Cartão salvo com sucesso." };
}

export async function deleteCardAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = uuidSchema.safeParse(formData.get("id")); if (!parsed.success) return { ok: false, message: "Cartão inválido." };
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { error } = await context.supabase.from("cards").delete().eq("id", parsed.data);
  if (error) return databaseError("excluir cartão", error.code);
  revalidatePath("/cartoes"); return { ok: true, data: "Cartão excluído." };
}
