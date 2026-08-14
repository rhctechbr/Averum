import { z } from "zod";

export const emailSchema = z.string().trim().email("Informe um e-mail válido.").max(254);
export const passwordSchema = z.string().min(10, "A senha deve ter pelo menos 10 caracteres.").max(128);

export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const signupSchema = loginSchema.extend({
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"], message: "As senhas não coincidem.",
});
export const recoverySchema = z.object({ email: emailSchema });
export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"], message: "As senhas não coincidem.",
});
