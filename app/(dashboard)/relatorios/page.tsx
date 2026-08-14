import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryChart, EvolutionChart } from "@/components/reports/report-charts";

export default async function ReportsPage() {
  const supabase = await createClient();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const current = new Date(`${today.slice(0, 7)}-01T12:00:00Z`); const start = new Date(current); start.setUTCMonth(start.getUTCMonth() - 5); const end = new Date(current); end.setUTCMonth(end.getUTCMonth() + 1);
  const { data, error } = await supabase.from("transactions").select("kind,amount,transaction_date,category_id").in("kind", ["income", "expense"]).gte("transaction_date", start.toISOString().slice(0, 10)).lt("transaction_date", end.toISOString().slice(0, 10)).limit(10000);
  const { data: categories } = await supabase.from("categories").select("id,name");
  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const currentPrefix = today.slice(0, 7); const categoryMap = new Map<string, number>();
  for (const row of data ?? []) if (row.kind === "expense" && row.transaction_date.startsWith(currentPrefix)) { const name = categoryNames.get(row.category_id ?? "") ?? "Sem categoria"; categoryMap.set(name, (categoryMap.get(name) ?? 0) + row.amount); }
  const categoryData = [...categoryMap].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const evolution = Array.from({ length: 6 }, (_, index) => { const date = new Date(start); date.setUTCMonth(date.getUTCMonth() + index); const prefix = date.toISOString().slice(0, 7); const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" }).format(date).replace(".", ""); const rows = (data ?? []).filter((item) => item.transaction_date.startsWith(prefix)); return { month, receitas: rows.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0), despesas: rows.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0) }; });
  return <><PageHeader title="Relatórios" subtitle="Leituras objetivas dos últimos meses." />{error ? <p className="text-negative">Não foi possível carregar os relatórios.</p> : <div className="grid gap-8 xl:grid-cols-2"><section className="rounded-lg border bg-surface p-5"><h2 className="text-lg font-semibold">Gastos por categoria</h2><p className="text-sm text-muted">Mês atual</p><CategoryChart data={categoryData} /></section><section className="rounded-lg border bg-surface p-5"><h2 className="text-lg font-semibold">Receitas vs despesas</h2><p className="text-sm text-muted">Seis meses civis</p><EvolutionChart data={evolution} /></section></div>}</>;
}
