import { addMonthsClamped, monthStart } from "@/lib/utils/dates";
import { splitSalary } from "@/lib/finance/salary";

export type PendingExpense = { dueDate: string; amountCents: number };

export type SalaryWindow = {
  part: 40 | 60;
  entryCents: number;
  committedCents: number;
  differenceCents: number;
  startsOn: string;
  endsOn: string;
};

export function salaryCashFlow(
  monthlyCents: number,
  competence: string,
  expenses: PendingExpense[],
): SalaryWindow[] {
  const [first, second] = splitSalary(monthlyCents, competence);
  const nextMonth = addMonthsClamped(monthStart(competence), 1);
  const nextMonthDay14 = `${nextMonth.slice(0, 8)}14`;
  const dayBeforeSecond = new Date(`${second.date}T00:00:00Z`);
  dayBeforeSecond.setUTCDate(dayBeforeSecond.getUTCDate() - 1);
  const firstEnd = dayBeforeSecond.toISOString().slice(0, 10);

  const sumBetween = (start: string, end: string) =>
    expenses.reduce(
      (sum, expense) =>
        expense.dueDate >= start && expense.dueDate <= end ? sum + expense.amountCents : sum,
      0,
    );

  const firstCommitted = sumBetween(first.date, firstEnd);
  const secondCommitted = sumBetween(second.date, nextMonthDay14);
  return [
    {
      part: 40,
      entryCents: first.amountCents,
      committedCents: firstCommitted,
      differenceCents: first.amountCents - firstCommitted,
      startsOn: first.date,
      endsOn: firstEnd,
    },
    {
      part: 60,
      entryCents: second.amountCents,
      committedCents: secondCommitted,
      differenceCents: second.amountCents - secondCommitted,
      startsOn: second.date,
      endsOn: nextMonthDay14,
    },
  ];
}
