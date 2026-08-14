import { describe, expect, it } from "vitest";
import { accountBalance, consolidatedBalance, type BalanceTransaction } from "./balance";

const transactions: BalanceTransaction[] = [
  { kind: "income", amountCents: 5000, isPaid: true, accountId: "a" },
  { kind: "income", amountCents: 9000, isPaid: false, accountId: "a" },
  { kind: "expense", amountCents: 2000, isPaid: true, accountId: "a" },
  { kind: "expense", amountCents: 7000, isPaid: false, accountId: "a" },
  { kind: "expense", amountCents: 3000, isPaid: true, cardId: "card" },
  {
    kind: "transfer",
    amountCents: 1000,
    isPaid: true,
    transferFromAccountId: "a",
    transferToAccountId: "b",
  },
];

describe("balances", () => {
  it("considera saldo inicial, pagos e transferências", () => {
    expect(accountBalance("a", 10_000, transactions)).toBe(12_000);
    expect(accountBalance("b", 2_000, transactions)).toBe(3_000);
  });

  it("transferência não altera o consolidado", () => {
    expect(
      consolidatedBalance(
        [
          { id: "a", initialBalanceCents: 10_000 },
          { id: "b", initialBalanceCents: 2_000 },
        ],
        transactions,
      ),
    ).toBe(15_000);
  });
});
