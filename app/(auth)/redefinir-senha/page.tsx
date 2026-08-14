import { AuthForm } from "@/components/auth/auth-form";
import { updatePasswordAction } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  return <><h1 className="text-3xl font-semibold">Defina uma nova senha</h1><p className="mb-8 mt-2 text-muted">Escolha uma senha com pelo menos 10 caracteres.</p><AuthForm action={updatePasswordAction} mode="reset" /></>;
}
