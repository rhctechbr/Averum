import { AuthForm } from "@/components/auth/auth-form";
import { recoveryAction } from "@/lib/actions/auth";

export default function RecoveryPage() {
  return <><h1 className="text-3xl font-semibold">Recupere sua senha</h1><p className="mb-8 mt-2 text-muted">Enviaremos um link seguro para seu e-mail.</p><AuthForm action={recoveryAction} mode="recovery" /></>;
}
