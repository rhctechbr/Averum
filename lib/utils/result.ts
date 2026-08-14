import type { ZodError } from "zod";
import type { ActionResult } from "@/types/domain";

export const INITIAL_ACTION_STATE: ActionResult = { ok: true };

export function validationError(error: ZodError): ActionResult {
  return {
    ok: false,
    message: "Revise os campos indicados.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export function databaseError(action: string, code?: string): ActionResult {
  console.error(`[Averum] ${action} falhou`, { code: code ?? "unknown" });
  return { ok: false, message: "Não foi possível concluir a operação." };
}
