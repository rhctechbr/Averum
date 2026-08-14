import { z } from "zod";
import { moneyInputSchema, uuidSchema } from "./common";

export const accountSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().trim().min(1).max(80),
  type: z.enum(["checking", "savings", "cash"]),
  initialBalance: moneyInputSchema,
});
