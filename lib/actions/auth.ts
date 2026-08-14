"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, recoverySchema, signupSchema, updatePasswordSchema } from "@/lib/validators/auth";
import { validationError } from "@/lib/utils/result";
import type { ActionResult } from "@/types/domain";

function fields(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function loginAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = loginSchema.safeParse(fields(formData));
  if (!parsed.success) return validationError(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "E-mail ou senha incorretos." };
  redirect("/dashboard");
}

export async function signupAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = signupSchema.safeParse(fields(formData));
  if (!parsed.success) return validationError(parsed.error);
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${origin}/login?confirmado=1` },
  });
  if (error) return { ok: false, message: "Não foi possível criar a conta." };
  return { ok: true, data: "Cadastro realizado. Confirme seu e-mail para entrar." };
}

export async function recoveryAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = recoverySchema.safeParse(fields(formData));
  if (!parsed.success) return validationError(parsed.error);
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/redefinir-senha`,
  });
  return { ok: true, data: "Se o e-mail estiver cadastrado, enviaremos as instruções." };
}

export async function updatePasswordAction(_: ActionResult<string>, formData: FormData): Promise<ActionResult<string>> {
  const parsed = updatePasswordSchema.safeParse(fields(formData));
  if (!parsed.success) return validationError(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "O link expirou ou a sessão de recuperação é inválida." };
  return { ok: true, data: "Senha redefinida. Você já pode acessar sua conta." };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
