"use server";

import { revalidatePath } from "next/cache";
import { parseMoneyToCents } from "@/lib/finance/money";
import { salaryGenerationSchema, salarySettingSchema } from "@/lib/validators/salary";
import { databaseError, validationError } from "@/lib/utils/result";
import type { ActionResult } from "@/types/domain";
import { requireUser } from "./context";

export async function saveSalarySettingAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = salarySettingSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return validationError(parsed.error);
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { data: current } = await context.supabase.from("salary_settings").select("salary_category_id").maybeSingle();
  let categoryId = current?.salary_category_id;
  if (!categoryId) {
    const { data: category } = await context.supabase.from("categories").select("id").eq("type", "income").ilike("name", "Salário").limit(1).maybeSingle();
    categoryId = category?.id;
  }
  if (!categoryId) return { ok: false, message: "A categoria de receita Salário não foi encontrada." };
  const { error } = await context.supabase.from("salary_settings").upsert({
    user_id: context.user.id, monthly_amount: parseMoneyToCents(parsed.data.monthlyAmount) / 100,
    account_id: parsed.data.accountId, salary_category_id: categoryId, salary_category_type: "income",
  }, { onConflict: "user_id" });
  if (error) return databaseError("salvar salário", error.code);
  revalidatePath("/configuracoes"); revalidatePath("/dashboard");
  return { ok: true, data: "Configuração de salário salva." };
}

export async function generateSalaryAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = salaryGenerationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return validationError(parsed.error);
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { error } = await context.supabase.rpc("generate_salary_month", { p_competence: parsed.data.competence });
  if (error?.code === "23505") return { ok: false, message: "O salário deste mês já foi gerado." };
  if (error) return databaseError("gerar salário", error.code);
  revalidatePath("/configuracoes"); revalidatePath("/dashboard"); revalidatePath("/lancamentos");
  return { ok: true, data: "As duas entradas do salário foram geradas." };
}
