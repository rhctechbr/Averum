export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function addMonthsClamped(isoDate: string, months: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new Error("Data inválida.");

  const originalYear = Number(match[1]);
  const originalMonth = Number(match[2]) - 1;
  const originalDay = Number(match[3]);
  const base = new Date(Date.UTC(originalYear, originalMonth + months, 1));
  const year = base.getUTCFullYear();
  const monthIndex = base.getUTCMonth();
  const day = Math.min(originalDay, daysInMonth(year, monthIndex));

  return `${year.toString().padStart(4, "0")}-${(monthIndex + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export function monthStart(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(isoDate);
  if (!match) throw new Error("Data inválida.");
  return `${match[1]}-${match[2]}-01`;
}
