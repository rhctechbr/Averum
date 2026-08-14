export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number | string): string {
  return brlFormatter.format(Number(value));
}

export function formatDateBR(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
