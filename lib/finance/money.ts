const BRL_INPUT = /^-?(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{1,2})?$/;

export function parseMoneyToCents(input: string): number {
  const normalized = input.trim();
  if (!BRL_INPUT.test(normalized)) {
    throw new Error("Valor monetário inválido.");
  }

  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [integerPart, decimalPart = ""] = unsigned.replaceAll(".", "").split(",");
  const cents = Number.parseInt(integerPart, 10) * 100 + Number.parseInt(decimalPart.padEnd(2, "0") || "0", 10);

  if (!Number.isSafeInteger(cents)) {
    throw new Error("Valor monetário fora do limite seguro.");
  }
  return negative ? -cents : cents;
}

export function centsToDecimal(cents: number): string {
  if (!Number.isSafeInteger(cents)) {
    throw new Error("O valor em centavos deve ser um inteiro seguro.");
  }
  return (cents / 100).toFixed(2);
}

export function decimalToCents(value: string | number): number {
  const normalized = typeof value === "number" ? value.toFixed(2) : value;
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new Error("Decimal monetário inválido.");
  const [, sign, integerPart, decimalPart = ""] = match;
  const cents = Number.parseInt(integerPart, 10) * 100 + Number.parseInt(decimalPart.padEnd(2, "0"), 10);
  if (!Number.isSafeInteger(cents)) throw new Error("Valor monetário fora do limite seguro.");
  return sign === "-" ? -cents : cents;
}
