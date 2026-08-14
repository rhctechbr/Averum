import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RowAction } from "@/components/ui/row-action";
import { CategoryForm } from "@/components/categories/category-form";
import { deleteCategoryAction } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const supabase = await createClient(); const { data: categories, error } = await supabase.from("categories").select("*").order("type").order("name");
  return <><PageHeader title="Categorias" subtitle="Classifique receitas e despesas." action={<Sheet title="Nova categoria" trigger={<Button><Plus size={17} />Nova categoria</Button>}><CategoryForm /></Sheet>} />
    {error ? <p className="text-negative">Não foi possível carregar as categorias.</p> : <div className="grid gap-8 lg:grid-cols-2">{(["expense", "income"] as const).map((type) => <section key={type}><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{type === "expense" ? "Despesas" : "Receitas"}</h2><div className="divide-y border-y">{categories?.filter((category) => category.type === type).map((category) => <div key={category.id} className="flex items-center justify-between py-3"><span>{category.name}</span><div className="flex"><Sheet title="Editar categoria" trigger={<Button variant="ghost" className="h-9 w-9 px-0" aria-label="Editar"><Pencil size={16} /></Button>}><CategoryForm category={category} /></Sheet><RowAction action={deleteCategoryAction} id={category.id} label="Excluir categoria" destructive compact /></div></div>)}</div></section>)}</div>}
  </>;
}
