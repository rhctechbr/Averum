import { addMonthsClamped } from "@/lib/utils/dates";

export function calculateCardDueDate(
  transactionDate: string,
  closingDay: number,
  dueDay: number,
): string {
  if (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 28) {
    throw new Error("Dia de fechamento inválido.");
  }
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
    throw new Error("Dia de vencimento inválido.");
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(transactionDate);
  if (!match) throw new Error("Data da compra inválida.");
  const purchaseDay = Number(match[3]);
  let closingMonth = `${match[1]}-${match[2]}-01`;
  if (purchaseDay > closingDay) closingMonth = addMonthsClamped(closingMonth, 1);
  const dueMonth = dueDay > closingDay ? closingMonth : addMonthsClamped(closingMonth, 1);
  return `${dueMonth.slice(0, 8)}${dueDay.toString().padStart(2, "0")}`;
}
