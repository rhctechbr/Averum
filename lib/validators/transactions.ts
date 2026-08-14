import { z } from "zod";
import { dateSchema, positiveMoneyInputSchema, uuidSchema } from "./common";
import { parseMoneyToCents } from "@/lib/finance/money";

const optionalUuid = z.union([uuidSchema, z.literal("")]).transform((value) => value || null);
const optionalDate = z.union([dateSchema, z.literal("")]).transform((value) => value || null);

export const transactionSchema = z.object({
  id: z.union([uuidSchema, z.literal("")]).optional(),
  kind: z.enum(["income", "expense", "transfer"]),
  amount: positiveMoneyInputSchema,
  transactionDate: dateSchema,
  description: z.string().trim().max(220, "Use até 220 caracteres."),
  categoryId: optionalUuid,
  accountId: optionalUuid,
  cardId: optionalUuid,
  transferFromAccountId: optionalUuid,
  transferToAccountId: optionalUuid,
  dueDate: optionalDate,
  isPaid: z.string().optional().transform((value) => value === "on"),
}).superRefine((value, context) => {
  if (value.kind !== "transfer" && !value.description) context.addIssue({ code: "custom", path: ["description"], message: "Informe a descrição." });
  if (value.kind === "income" && (!value.categoryId || !value.accountId)) context.addIssue({ code: "custom", path: ["categoryId"], message: "Selecione categoria e conta." });
  if (value.kind === "expense" && (!value.categoryId || Boolean(value.accountId) === Boolean(value.cardId))) context.addIssue({ code: "custom", path: ["accountId"], message: "Selecione exatamente uma conta ou cartão." });
  if (value.kind === "expense" && value.accountId && !value.isPaid && !value.dueDate) context.addIssue({ code: "custom", path: ["dueDate"], message: "Informe o vencimento." });
  if (value.kind === "transfer" && (!value.transferFromAccountId || !value.transferToAccountId || value.transferFromAccountId === value.transferToAccountId)) context.addIssue({ code: "custom", path: ["transferFromAccountId"], message: "Escolha contas diferentes." });
});

export const installmentSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição.").max(200, "Use até 200 caracteres."),
  totalAmount: positiveMoneyInputSchema,
  installmentsCount: z.coerce.number().int().min(2).max(60),
  firstInstallmentDate: dateSchema,
  categoryId: uuidSchema,
  accountId: optionalUuid,
  cardId: optionalUuid,
}).superRefine((value, context) => {
  if (Boolean(value.accountId) === Boolean(value.cardId)) context.addIssue({ code: "custom", path: ["accountId"], message: "Selecione exatamente uma conta ou cartão." });
  if (parseMoneyToCents(value.totalAmount) < value.installmentsCount) context.addIssue({ code: "custom", path: ["totalAmount"], message: "O total deve permitir parcelas mínimas de R$ 0,01." });
});

export const paidSchema = z.object({ id: uuidSchema, isPaid: z.enum(["true", "false"]) });
