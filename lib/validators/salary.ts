import { z } from "zod";
import { dateSchema, positiveMoneyInputSchema, uuidSchema } from "./common";
import { parseMoneyToCents } from "@/lib/finance/money";

export const salarySettingSchema = z.object({ monthlyAmount: positiveMoneyInputSchema, accountId: uuidSchema }).refine(
  (value) => parseMoneyToCents(value.monthlyAmount) >= 2,
  { path: ["monthlyAmount"], message: "O salário mínimo é R$ 0,02." },
);
export const salaryGenerationSchema = z.object({ competence: dateSchema });
