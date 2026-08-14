"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import type { ActionResult } from "@/types/domain";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/form-status";
import { createClient } from "@/lib/supabase/client";

type AuthAction = (state: ActionResult<string>, formData: FormData) => Promise<ActionResult<string>>;

export function AuthForm({
  action,
  mode,
}: {
  action: AuthAction;
  mode: "login" | "signup" | "recovery" | "reset";
}) {
  const [state, formAction] = useActionState(action, { ok: true });
  const [recoveryReady, setRecoveryReady] = useState(mode !== "reset");
  const needsEmail = mode !== "reset";
  const needsPassword = mode === "login" || mode === "signup" || mode === "reset";
  const needsConfirmation = mode === "signup" || mode === "reset";

  useEffect(() => {
    if (mode !== "reset") return;
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) { setRecoveryReady(true); return; }
    void createClient().auth.exchangeCodeForSession(code).finally(() => setRecoveryReady(true));
  }, [mode]);

  return (
    <form action={formAction} className="space-y-4">
      {needsEmail && <label className="block text-sm font-medium">E-mail<Input className="mt-2" name="email" type="email" autoComplete="email" required /></label>}
      {needsPassword && <label className="block text-sm font-medium">Senha<Input className="mt-2" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={10} required /></label>}
      {needsConfirmation && <label className="block text-sm font-medium">Confirmar senha<Input className="mt-2" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required /></label>}
      {!state.ok && <p role="alert" className="rounded-md bg-negative/10 p-3 text-sm text-negative">{state.message}</p>}
      {state.ok && state.data && <p role="status" className="rounded-md bg-positive/10 p-3 text-sm text-positive">{state.data}</p>}
      {recoveryReady ? <SubmitButton label={mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : mode === "recovery" ? "Enviar instruções" : "Redefinir senha"} /> : <p className="text-sm text-muted">Validando link seguro…</p>}
      {mode === "login" && <div className="flex justify-between text-sm"><Link href="/cadastro" className="text-primary hover:underline">Criar conta</Link><Link href="/esqueci-senha" className="text-primary hover:underline">Esqueci a senha</Link></div>}
      {mode !== "login" && <Link href="/login" className="block text-sm text-primary hover:underline">Voltar para o login</Link>}
    </form>
  );
}
