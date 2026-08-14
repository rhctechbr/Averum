export type BalanceTransaction = {
  kind: "income" | "expense" | "transfer";
  amountCents: number;
  isPaid: boolean;
  accountId?: string | null;
  cardId?: string | null;
  transferFromAccountId?: string | null;
  transferToAccountId?: string | null;
};

export function accountBalance(
  accountId: string,
  initialBalanceCents: number,
  transactions: BalanceTransaction[],
): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.kind === "transfer") {
      if (transaction.transferFromAccountId === accountId) balance -= transaction.amountCents;
      if (transaction.transferToAccountId === accountId) balance += transaction.amountCents;
      return balance;
    }
    if (!transaction.isPaid || transaction.cardId || transaction.accountId !== accountId) return balance;
    return transaction.kind === "income"
      ? balance + transaction.amountCents
      : balance - transaction.amountCents;
  }, initialBalanceCents);
}

export function consolidatedBalance(
  accounts: { id: string; initialBalanceCents: number }[],
  transactions: BalanceTransaction[],
): number {
  return accounts.reduce(
    (total, account) => total + accountBalance(account.id, account.initialBalanceCents, transactions),
    0,
  );
}
