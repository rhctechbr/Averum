import { describe, expect, it } from "vitest";
import { centsToDecimal, decimalToCents, parseMoneyToCents } from "./money";

describe("money", () => {
  it("interpreta entrada brasileira sem ponto flutuante", () => {
    expect(parseMoneyToCents("R$ 1.234,56".replace("R$ ", ""))).toBe(123_456);
    expect(parseMoneyToCents("-10,05")).toBe(-1005);
  });

  it("converte centavos para decimal de persistência", () => {
    expect(centsToDecimal(123_456)).toBe("1234.56");
    expect(decimalToCents("1234.56")).toBe(123_456);
  });
});
