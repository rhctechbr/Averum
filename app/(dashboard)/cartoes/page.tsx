import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RowAction } from "@/components/ui/row-action";
import { CardForm } from "@/components/cards/card-form";
import { deleteCardAction } from "@/lib/actions/cards";
import { formatBRL } from "@/lib/utils/currency";

export default async function CardsPage() {
  const supabase = await createClient(); const { data: cards, error } = await supabase.from("cards").select("*").order("created_at");
  return <><PageHeader title="Cartões" subtitle="Dados de crédito usados no cálculo de vencimentos." action={<Sheet title="Novo cartão" trigger={<Button><Plus size={17} />Novo cartão</Button>}><CardForm /></Sheet>} />
    {error ? <p className="text-negative">Não foi possível carregar os cartões.</p> : !cards?.length ? <div className="border-y py-12 text-center text-muted">Nenhum cartão cadastrado.</div> : <div className="grid gap-4 lg:grid-cols-2">{cards.map((card) => <article key={card.id} className="rounded-lg border bg-surface p-5"><div className="mb-8 h-2 w-14 rounded-full" style={{ backgroundColor: card.color }} /><div className="flex items-end justify-between gap-4"><div><h2 className="font-semibold">{card.name}</h2><p className="mt-1 text-sm text-muted">Fecha dia {card.closing_day} · vence dia {card.due_day}</p><p className="mt-3 tabular-nums text-lg font-semibold">{formatBRL(card.credit_limit)}</p></div><div className="flex"><Sheet title="Editar cartão" trigger={<Button variant="ghost" className="h-9 w-9 px-0" aria-label="Editar"><Pencil size={17} /></Button>}><CardForm card={card} /></Sheet><RowAction action={deleteCardAction} id={card.id} label="Excluir cartão" destructive compact /></div></div></article>)}</div>}
  </>;
}
