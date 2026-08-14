import { describe, expect, it } from "vitest";
import { splitSalary } from "./salary";

describe("splitSalary", () => {
  it("mantém 40% + 60% exatamente igual ao total com centavos", () => {
    const entries = splitSalary(123_45, "2026-08-01");
    expect(entries.map((entry) => entry.amountCents)).toEqual([4938, 7407]);
    expect(entries.reduce((sum, entry) => sum + entry.amountCents, 0)).toBe(123_45);
  });

  it("usa o último dia de fevereiro", () => {
    expect(splitSalary(100_00, "2026-02-01").map((entry) => entry.date)).toEqual([
      "2026-02-15",
      "2026-02-28",
    ]);
    expect(splitSalary(100_00, "2028-02-01")[1].date).toBe("2028-02-29");
  });

  it("rejeita salário inferior a R$ 0,02", () => {
    expect(() => splitSalary(1, "2026-08-01")).toThrow(/R\$ 0,02/);
  });
});
