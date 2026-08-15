import { describe, expect, it } from "vitest";
import { transactionSchema } from "./transactions";

const base = { id: "", kind: "expense", source: "account", amount: "", transactionDate: "2026-08-15", description: "", categoryId: "", accountId: "", cardId: "", transferFromAccountId: "", transferToAccountId: "", dueDate: "", isPaid: "" };

describe("transactionSchema", () => {
  it("devolve erros específicos para uma despesa vazia", () => {
    const result = transactionSchema.safeParse(base);
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.flatten().fieldErrors;
    expect(fields.amount?.[0]).toBe("Informe um valor válido.");
    expect(fields.description?.[0]).toBe("Informe a descrição.");
    expect(fields.categoryId?.[0]).toBe("Selecione uma categoria.");
    expect(fields.accountId?.[0]).toBe("Selecione uma conta.");
  });

  it("direciona o erro de origem para o cartão selecionado", () => {
    const result = transactionSchema.safeParse({ ...base, source: "card", amount: "10,00", description: "Compra" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.cardId?.[0]).toBe("Selecione um cartão.");
  });
});
