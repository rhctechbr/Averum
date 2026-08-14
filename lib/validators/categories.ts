import { z } from "zod";
import { uuidSchema } from "./common";

export const categorySchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().trim().min(1).max(80),
  type: z.enum(["income", "expense"]),
});
