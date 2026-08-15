import { z } from "zod";
import { dateSchema, positiveMoneyInputSchema, uuidSchema } from "./common";
import { parseMoneyToCents } from "@/lib/finance/money";

const optionalUuid = z.union([uuidSchema, z.literal("")]).transform((value) => value || null);
const optionalDate = z.union([dateSchema, z.literal("")]).transform((value) => value || null);

export const transactionSchema = z.object({
  id: z.union([uuidSchema, z.literal("")]).optional(),
  kind: z.enum(["income", "expense", "transfer"]),
  source: z.enum(["account", "card"]).optional(),
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
  if (value.kind === "income" && !value.categoryId) context.addIssue({ code: "custom", path: ["categoryId"], message: "Selecione uma categoria." });
  if (value.kind === "income" && !value.accountId) context.addIssue({ code: "custom", path: ["accountId"], message: "Selecione a conta de entrada." });
  if (value.kind === "expense" && !value.categoryId) context.addIssue({ code: "custom", path: ["categoryId"], message: "Selecione uma categoria." });
  if (value.kind === "expense" && Boolean(value.accountId) === Boolean(value.cardId)) {
    const path = value.source === "card" ? "cardId" : "accountId";
    const message = value.source === "card" ? "Selecione um cartão." : "Selecione uma conta.";
    context.addIssue({ code: "custom", path: [path], message });
  }
  if (value.kind === "expense" && value.accountId && !value.isPaid && !value.dueDate) context.addIssue({ code: "custom", path: ["dueDate"], message: "Informe o vencimento." });
  if (value.kind === "transfer" && !value.transferFromAccountId) context.addIssue({ code: "custom", path: ["transferFromAccountId"], message: "Selecione a conta de origem." });
  if (value.kind === "transfer" && !value.transferToAccountId) context.addIssue({ code: "custom", path: ["transferToAccountId"], message: "Selecione a conta de destino." });
  if (value.kind === "transfer" && value.transferFromAccountId && value.transferFromAccountId === value.transferToAccountId) context.addIssue({ code: "custom", path: ["transferToAccountId"], message: "A conta de destino deve ser diferente." });
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
