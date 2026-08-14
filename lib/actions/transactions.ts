"use server";

import { revalidatePath } from "next/cache";
import { calculateCardDueDate } from "@/lib/finance/card-due-date";
import { parseMoneyToCents } from "@/lib/finance/money";
import { installmentSchema, paidSchema, transactionSchema } from "@/lib/validators/transactions";
import { uuidSchema } from "@/lib/validators/common";
import { databaseError, validationError } from "@/lib/utils/result";
import type { ActionResult } from "@/types/domain";
import { requireUser } from "./context";

const refresh = () => { revalidatePath("/lancamentos"); revalidatePath("/dashboard"); revalidatePath("/relatorios"); };

export async function saveTransactionAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return validationError(parsed.error);
  const context = await requireUser();
  if (!context) return { ok: false, message: "Sua sessão expirou." };
  const value = parsed.data;
  let dueDate = value.dueDate;
  if (value.kind === "expense" && value.cardId) {
    const { data: card } = await context.supabase.from("cards").select("closing_day,due_day").eq("id", value.cardId).single();
    if (!card) return { ok: false, message: "Cartão não encontrado." };
    dueDate = calculateCardDueDate(value.transactionDate, card.closing_day, card.due_day);
  }
  const payload = {
    user_id: context.user.id,
    kind: value.kind,
    amount: parseMoneyToCents(value.amount) / 100,
    transaction_date: value.transactionDate,
    description: value.kind === "transfer" && !value.description ? "Transferência" : value.description,
    category_id: value.kind === "transfer" ? null : value.categoryId,
    category_type: value.kind === "transfer" ? null : value.kind,
    account_id: value.kind === "income" ? value.accountId : value.kind === "expense" ? value.accountId : null,
    card_id: value.kind === "expense" ? value.cardId : null,
    transfer_from_account_id: value.kind === "transfer" ? value.transferFromAccountId : null,
    transfer_to_account_id: value.kind === "transfer" ? value.transferToAccountId : null,
    is_paid: value.kind === "transfer" ? true : value.isPaid,
    due_date: value.kind === "expense" ? dueDate : null,
  };
  const result = value.id
    ? await context.supabase.from("transactions").update(payload).eq("id", value.id).is("installment_group_id", null).is("salary_setting_id", null)
    : await context.supabase.from("transactions").insert(payload);
  if (result.error) return databaseError("salvar lançamento", result.error.code);
  refresh();
  return { ok: true, data: "Lançamento salvo." };
}

export async function createInstallmentAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = installmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return validationError(parsed.error);
  const context = await requireUser();
  if (!context) return { ok: false, message: "Sua sessão expirou." };
  const value = parsed.data;
  const { error } = await context.supabase.rpc("create_installment_plan", {
    p_description: value.description, p_total_amount: parseMoneyToCents(value.totalAmount) / 100,
    p_installments_count: value.installmentsCount, p_first_installment_date: value.firstInstallmentDate,
    p_category_id: value.categoryId, p_account_id: value.accountId, p_card_id: value.cardId,
  });
  if (error) return databaseError("criar parcelamento", error.code);
  refresh();
  return { ok: true, data: "Parcelamento criado com todas as parcelas." };
}

export async function togglePaidAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = paidSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Lançamento inválido." };
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { error } = await context.supabase.from("transactions").update({ is_paid: parsed.data.isPaid === "true" }).eq("id", parsed.data.id);
  if (error) return databaseError("atualizar pagamento", error.code);
  refresh();
  return { ok: true, data: "Status atualizado." };
}

export async function deleteTransactionAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = uuidSchema.safeParse(formData.get("id")); if (!parsed.success) return { ok: false, message: "Lançamento inválido." };
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { error } = await context.supabase.from("transactions").delete().eq("id", parsed.data).is("installment_group_id", null).is("salary_setting_id", null);
  if (error) return databaseError("excluir lançamento", error.code);
  refresh();
  return { ok: true, data: "Lançamento excluído." };
}

export async function deleteInstallmentGroupAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = uuidSchema.safeParse(formData.get("id")); if (!parsed.success) return { ok: false, message: "Parcelamento inválido." };
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { error } = await context.supabase.from("installment_groups").delete().eq("id", parsed.data);
  if (error) return { ok: false, message: "Não é possível excluir um grupo com parcelas pagas ou vínculos ativos." };
  refresh();
  return { ok: true, data: "Parcelamento excluído." };
}
