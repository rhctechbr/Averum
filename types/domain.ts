export type AccountType = "checking" | "savings" | "cash";
export type CategoryType = "income" | "expense";
export type TransactionKind = CategoryType | "transfer";
export type SalaryPart = 40 | 60;

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
