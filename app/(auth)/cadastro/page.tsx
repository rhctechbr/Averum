import { AuthForm } from "@/components/auth/auth-form";
import { signupAction } from "@/lib/actions/auth";

export default function SignupPage() {
  return <><h1 className="text-3xl font-semibold">Crie sua conta</h1><p className="mb-8 mt-2 text-muted">Use uma senha com pelo menos 10 caracteres.</p><AuthForm action={signupAction} mode="signup" /></>;
}
