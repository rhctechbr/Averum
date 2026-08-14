import { addMonthsClamped, daysInMonth, monthStart } from "@/lib/utils/dates";

export type SalaryEntry = { part: 40 | 60; amountCents: number; date: string };

export function splitSalary(monthlyCents: number, competence: string): SalaryEntry[] {
  if (!Number.isSafeInteger(monthlyCents) || monthlyCents < 2) {
    throw new Error("O salário mensal mínimo é R$ 0,02.");
  }

  const firstAmount = Math.round(monthlyCents * 0.4);
  const secondAmount = monthlyCents - firstAmount;
  const firstDay = monthStart(competence);
  const [yearText, monthText] = firstDay.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const secondDay = Math.min(30, daysInMonth(year, monthIndex));

  return [
    { part: 40, amountCents: firstAmount, date: `${yearText}-${monthText}-15` },
    {
      part: 60,
      amountCents: secondAmount,
      date: `${yearText}-${monthText}-${secondDay.toString().padStart(2, "0")}`,
    },
  ];
}

export function nextSalaryMonth(competence: string): string {
  return monthStart(addMonthsClamped(monthStart(competence), 1));
}
