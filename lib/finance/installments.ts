import { addMonthsClamped } from "@/lib/utils/dates";

export type Installment = {
  number: number;
  amountCents: number;
  date: string;
};

export function splitInstallments(
  totalCents: number,
  count: number,
  firstInstallmentDate: string,
): Installment[] {
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
    throw new Error("O total deve ser positivo e expresso em centavos inteiros.");
  }
  if (!Number.isInteger(count) || count < 2 || count > 60) {
    throw new Error("A quantidade deve estar entre 2 e 60 parcelas.");
  }
  if (totalCents < count) {
    throw new Error("O total deve permitir ao menos R$ 0,01 por parcela.");
  }

  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;

  return Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    amountCents: base + (index < remainder ? 1 : 0),
    date: addMonthsClamped(firstInstallmentDate, index),
  }));
}
