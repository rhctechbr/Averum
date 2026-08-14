"use server";

import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/validators/categories";
import { uuidSchema } from "@/lib/validators/common";
import { requireUser } from "./context";
import { databaseError, validationError } from "@/lib/utils/result";
import type { ActionResult } from "@/types/domain";

export async function saveCategoryAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return validationError(parsed.error);
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const payload = { name: parsed.data.name, type: parsed.data.type, user_id: context.user.id };
  const result = parsed.data.id ? await context.supabase.from("categories").update(payload).eq("id", parsed.data.id) : await context.supabase.from("categories").insert(payload);
  if (result.error) return databaseError("salvar categoria", result.error.code);
  revalidatePath("/categorias"); return { ok: true, data: "Categoria salva com sucesso." };
}

export async function deleteCategoryAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = uuidSchema.safeParse(formData.get("id")); if (!parsed.success) return { ok: false, message: "Categoria inválida." };
  const context = await requireUser(); if (!context) return { ok: false, message: "Sua sessão expirou." };
  const { error } = await context.supabase.from("categories").delete().eq("id", parsed.data);
  if (error) return databaseError("excluir categoria", error.code);
  revalidatePath("/categorias"); return { ok: true, data: "Categoria excluída." };
}
