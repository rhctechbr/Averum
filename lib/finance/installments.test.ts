import { describe, expect, it } from "vitest";
import { splitInstallments } from "./installments";

describe("splitInstallments", () => {
  it("distribui R$ 100,00 em três parcelas sem perder centavos", () => {
    expect(splitInstallments(10_000, 3, "2026-01-10").map((item) => item.amountCents)).toEqual([
      3334, 3333, 3333,
    ]);
  });

  it("distribui múltiplos centavos restantes nas primeiras parcelas", () => {
    expect(splitInstallments(1001, 4, "2026-01-10").map((item) => item.amountCents)).toEqual([
      251, 250, 250, 250,
    ]);
  });

  it("mantém uma divisão exata", () => {
    expect(splitInstallments(1200, 3, "2026-01-10").map((item) => item.amountCents)).toEqual([
      400, 400, 400,
    ]);
  });

  it("retorna ao dia 31 depois de fevereiro", () => {
    expect(splitInstallments(400, 4, "2025-01-31").map((item) => item.date)).toEqual([
      "2025-01-31",
      "2025-02-28",
      "2025-03-31",
      "2025-04-30",
    ]);
  });

  it("considera fevereiro de ano bissexto", () => {
    expect(splitInstallments(300, 3, "2028-01-31").map((item) => item.date)).toEqual([
      "2028-01-31",
      "2028-02-29",
      "2028-03-31",
    ]);
  });

  it("rejeita parcelamento que produziria parcela zerada", () => {
    expect(() => splitInstallments(1, 2, "2026-01-10")).toThrow(/R\$ 0,01/);
  });
});
