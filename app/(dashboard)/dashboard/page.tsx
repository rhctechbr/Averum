import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Metric } from "@/components/dashboard/metric";
import { consolidatedBalance } from "@/lib/finance/balance";
import { salaryCashFlow } from "@/lib/finance/cash-flow";
import { formatBRL, formatDateBR } from "@/lib/utils/currency";

function monthBounds(today: string, offset = 0) {
  const base = new Date(`${today.slice(0, 7)}-01T12:00:00Z`); base.setUTCMonth(base.getUTCMonth() + offset);
  const start = base.toISOString().slice(0, 10); base.setUTCMonth(base.getUTCMonth() + 1);
  return { start, endExclusive: base.toISOString().slice(0, 10) };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const month = monthBounds(today); const thirdMonthEnd = monthBounds(today, 3).start;
  const [{ data: accounts, error: accountsError }, { data: all, error: transactionError }, { data: salary }] = await Promise.all([
    supabase.from("accounts").select("id,initial_balance"),
    supabase.from("transactions").select("id,kind,amount,is_paid,account_id,card_id,transfer_from_account_id,transfer_to_account_id,transaction_date,due_date,description,installment_group_id").limit(10000),
    supabase.from("salary_settings").select("monthly_amount").maybeSingle(),
  ]);
  if (accountsError || transactionError) return <><PageHeader title="Visão geral" subtitle="Seu dinheiro, sem ruído." /><p className="text-negative">Não foi possível carregar o resumo financeiro.</p></>;
  const rows = all ?? [];
  const balance = consolidatedBalance((accounts ?? []).map((a) => ({ id: a.id, initialBalanceCents: Math.round(a.initial_balance * 100) })), rows.map((t) => ({ kind: t.kind as "income" | "expense" | "transfer", amountCents: Math.round(t.amount * 100), isPaid: t.is_paid, accountId: t.account_id, cardId: t.card_id, transferFromAccountId: t.transfer_from_account_id, transferToAccountId: t.transfer_to_account_id })));
  const current = rows.filter((t) => t.transaction_date >= month.start && t.transaction_date < month.endExclusive);
  const income = current.filter((t) => t.kind === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = current.filter((t) => t.kind === "expense").reduce((sum, t) => sum + t.amount, 0);
  const upcoming = rows.filter((t) => t.kind === "expense" && !t.is_paid && t.due_date && t.due_date >= today).sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? "")).slice(0, 10);
  const installments = rows.filter((t) => t.kind === "expense" && !t.is_paid && t.installment_group_id && t.transaction_date >= month.start && t.transaction_date < thirdMonthEnd).reduce((sum, t) => sum + t.amount, 0);
  const pending = rows.filter((t) => t.kind === "expense" && !t.is_paid && t.due_date).map((t) => ({ dueDate: t.due_date!, amountCents: Math.round(t.amount * 100) }));
  const salaryFlow = salary ? salaryCashFlow(Math.round(salary.monthly_amount * 100), month.start, pending) : [];
  return <><PageHeader title="Visão geral" subtitle={`Posição de ${formatDateBR(today)}.`} />
    <Metric label="Saldo atual consolidado" value={formatBRL(balance / 100)} prominent detail="Saldos iniciais, movimentações pagas e transferências." />
    <div className="grid grid-cols-2 gap-x-8 border-b"><Metric label="Receitas do mês" value={formatBRL(income)} tone="positive" /><Metric label="Despesas do mês" value={formatBRL(expense)} tone="negative" /></div>
    <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]"><section><div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Próximos vencimentos</p><h2 className="mt-1 text-xl font-semibold">O que vem pela frente</h2></div><Link href="/lancamentos" className="flex items-center gap-1 text-sm text-primary">Ver todos <ArrowRight size={15} /></Link></div>{upcoming.length ? <div className="divide-y border-y">{upcoming.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate font-medium">{item.description}</p><p className="text-sm text-muted">{formatDateBR(item.due_date!)}</p></div><p className="tabular-nums font-semibold text-negative">{formatBRL(item.amount)}</p></div>)}</div> : <p className="border-y py-8 text-center text-sm text-muted">Nenhum vencimento pendente.</p>}</section>
      <aside className="space-y-6"><Metric label="Parcelas comprometidas · 3 meses" value={formatBRL(installments)} />{salary ? <section><p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Fluxo do salário</p><div className="space-y-3">{salaryFlow.map((window) => <div key={window.part} className="rounded-md border bg-surface p-4"><div className="flex justify-between"><strong>Entrada {window.part}%</strong><span className="tabular-nums">{formatBRL(window.entryCents / 100)}</span></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted">Comprometido</p><p className="tabular-nums">{formatBRL(window.committedCents / 100)}</p></div><div><p className="text-muted">Diferença</p><p className={`tabular-nums ${window.differenceCents < 0 ? "text-negative" : "text-positive"}`}>{formatBRL(window.differenceCents / 100)}</p></div></div></div>)}</div></section> : <Link href="/configuracoes" className="block rounded-md border p-4 text-sm text-primary">Configure o salário para visualizar as duas janelas de caixa.</Link>}</aside>
    </div>
  </>;
}
