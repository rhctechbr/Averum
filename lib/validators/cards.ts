import { z } from "zod";
import { positiveMoneyInputSchema, uuidSchema } from "./common";

export const cardSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().trim().min(1).max(80),
  creditLimit: positiveMoneyInputSchema,
  closingDay: z.coerce.number().int().min(1).max(28),
  dueDay: z.coerce.number().int().min(1).max(28),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});
