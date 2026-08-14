import { CircleCheck, Clock3, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RowAction } from "@/components/ui/row-action";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { InstallmentForm } from "@/components/transactions/installment-form";
import { deleteInstallmentGroupAction, deleteTransactionAction, togglePaidAction } from "@/lib/actions/transactions";
import { formatBRL, formatDateBR } from "@/lib/utils/currency";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const [{ data: transactions, error }, { data: accounts }, { data: cards }, { data: categories }, { data: groups }] = await Promise.all([
    supabase.from("transactions").select("*").order("transaction_date", { ascending: false }).limit(200),
    supabase.from("accounts").select("*").order("name"), supabase.from("cards").select("*").order("name"),
    supabase.from("categories").select("*").order("name"), supabase.from("installment_groups").select("id,description"),
  ]);
  const ready = Boolean(accounts?.length && categories?.length);
  return <><PageHeader title="Lançamentos" subtitle="Receitas, despesas, transferências e parcelas." action={<div className="flex gap-2"><Sheet title="Novo parcelamento" trigger={<Button variant="secondary">Parcelar</Button>}><InstallmentForm accounts={accounts ?? []} cards={cards ?? []} categories={categories ?? []} /></Sheet><Sheet title="Novo lançamento" trigger={<Button disabled={!ready}><Plus size={17} />Novo</Button>}><TransactionForm accounts={accounts ?? []} cards={cards ?? []} categories={categories ?? []} /></Sheet></div>} />
    {!ready && <p className="mb-6 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">Cadastre ao menos uma conta antes de lançar movimentações.</p>}
    {error ? <p className="text-negative">Não foi possível carregar os lançamentos.</p> : !transactions?.length ? <div className="border-y py-14 text-center text-muted">Nenhum lançamento por aqui ainda.</div> : <div className="divide-y border-y">{transactions.map((item) => {
      const generated = Boolean(item.installment_group_id || item.salary_setting_id);
      return <article key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className={item.is_paid ? "text-positive" : "text-warning"}>{item.is_paid ? <CircleCheck size={16} /> : <Clock3 size={16} />}</span><h2 className="truncate font-semibold">{item.description}</h2></div><p className="mt-1 text-sm text-muted">{formatDateBR(item.transaction_date)}{item.due_date && item.due_date !== item.transaction_date ? ` · vence ${formatDateBR(item.due_date)}` : ""}</p></div><div className="flex items-center justify-between gap-2 sm:justify-end"><p className={`mr-2 tabular-nums font-semibold ${item.kind === "income" ? "text-positive" : item.kind === "expense" ? "text-negative" : ""}`}>{item.kind === "expense" ? "−" : item.kind === "income" ? "+" : ""}{formatBRL(item.amount)}</p>{item.kind !== "transfer" && <RowAction action={togglePaidAction} id={item.id} fields={{ isPaid: String(!item.is_paid) }} label={item.is_paid ? "Marcar pendente" : "Marcar pago"} />}{!generated && <><Sheet title="Editar lançamento" trigger={<Button variant="ghost" className="h-9 w-9 px-0" aria-label="Editar"><Pencil size={16} /></Button>}><TransactionForm accounts={accounts ?? []} cards={cards ?? []} categories={categories ?? []} transaction={item} /></Sheet><RowAction action={deleteTransactionAction} id={item.id} label="Excluir lançamento" destructive compact /></>}</div></article>;
    })}</div>}
    {!!groups?.length && <section className="mt-10"><h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Parcelamentos</h2><div className="divide-y border-y">{groups.map((group) => <div key={group.id} className="flex items-center justify-between py-3 text-sm"><span>{group.description}</span><RowAction action={deleteInstallmentGroupAction} id={group.id} label="Excluir grupo" destructive /></div>)}</div><p className="mt-2 text-xs text-muted">A exclusão é bloqueada pelo banco se houver parcela paga.</p></section>}
  </>;
}
