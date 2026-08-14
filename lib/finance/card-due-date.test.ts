import { describe, expect, it } from "vitest";
import { calculateCardDueDate } from "./card-due-date";

describe("calculateCardDueDate", () => {
  it("calcula compra feita no fechamento", () => {
    expect(calculateCardDueDate("2026-08-10", 10, 20)).toBe("2026-08-20");
  });

  it("calcula compra feita depois do fechamento", () => {
    expect(calculateCardDueDate("2026-08-11", 10, 20)).toBe("2026-09-20");
  });

  it("leva o vencimento ao mês seguinte quando due_day não supera closing_day", () => {
    expect(calculateCardDueDate("2026-08-10", 20, 10)).toBe("2026-09-10");
  });
});
