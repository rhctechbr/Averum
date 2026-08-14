import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RowAction } from "@/components/ui/row-action";
import { AccountForm } from "@/components/accounts/account-form";
import { deleteAccountAction } from "@/lib/actions/accounts";
import { formatBRL } from "@/lib/utils/currency";

const labels: Record<string, string> = { checking: "Conta corrente", savings: "Poupança", cash: "Dinheiro" };
export default async function AccountsPage() {
  const supabase = await createClient(); const { data: accounts, error } = await supabase.from("accounts").select("*").order("created_at");
  return <><PageHeader title="Contas" subtitle="Contas bancárias e dinheiro disponível." action={<Sheet title="Nova conta" trigger={<Button><Plus size={17} />Nova conta</Button>}><AccountForm /></Sheet>} />
    {error ? <p className="text-negative">Não foi possível carregar as contas.</p> : !accounts?.length ? <div className="border-y py-12 text-center text-muted">Nenhuma conta cadastrada.</div> : <div className="divide-y border-y">{accounts.map((account) => <article key={account.id} className="flex items-center justify-between gap-4 py-4"><div><h2 className="font-semibold">{account.name}</h2><p className="text-sm text-muted">{labels[account.type]}</p></div><div className="flex items-center gap-2"><p className="mr-3 tabular-nums font-semibold">{formatBRL(account.initial_balance)}</p><Sheet title="Editar conta" trigger={<Button variant="ghost" className="h-9 w-9 px-0" aria-label="Editar"><Pencil size={17} /></Button>}><AccountForm account={account} /></Sheet><RowAction action={deleteAccountAction} id={account.id} label="Excluir conta" destructive compact /></div></article>)}</div>}
  </>;
}
