import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  return <><p className="mb-2 text-sm font-semibold text-primary">Averum</p><h1 className="text-3xl font-semibold">Acesse sua conta</h1><p className="mb-8 mt-2 text-muted">Entre para acompanhar sua vida financeira.</p><AuthForm action={loginAction} mode="login" /></>;
}
