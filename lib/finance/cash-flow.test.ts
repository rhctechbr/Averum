import { describe, expect, it } from "vitest";
import { salaryCashFlow } from "./cash-flow";

describe("salaryCashFlow", () => {
  it("separa compromissos nas janelas de 40% e 60%", () => {
    const result = salaryCashFlow(100_000, "2026-08-01", [
      { dueDate: "2026-08-15", amountCents: 10_000 },
      { dueDate: "2026-08-29", amountCents: 5_000 },
      { dueDate: "2026-08-30", amountCents: 20_000 },
      { dueDate: "2026-09-14", amountCents: 3_000 },
      { dueDate: "2026-09-15", amountCents: 99_000 },
    ]);

    expect(result[0]).toMatchObject({ entryCents: 40_000, committedCents: 15_000, differenceCents: 25_000 });
    expect(result[1]).toMatchObject({ entryCents: 60_000, committedCents: 23_000, differenceCents: 37_000 });
  });
});
