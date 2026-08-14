import { z } from "zod";

export const uuidSchema = z.string().uuid("Identificador inválido.");
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");
export const moneyInputSchema = z.string().trim().regex(
  /^-?(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{1,2})?$/,
  "Informe um valor válido.",
);
export const positiveMoneyInputSchema = moneyInputSchema.refine(
  (value) => !value.startsWith("-") && value !== "0" && value !== "0,00",
  "O valor deve ser maior que zero.",
);
