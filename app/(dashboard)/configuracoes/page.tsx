import Link from "next/link";
import { CreditCard, FolderTree, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { SalarySettingForm } from "@/components/salary/salary-setting-form";
import { SalaryGeneration } from "@/components/salary/salary-generation";
import { logoutAction } from "@/lib/actions/auth";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: accounts }, { data: setting }] = await Promise.all([supabase.from("accounts").select("*").order("name"), supabase.from("salary_settings").select("*").maybeSingle()]);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const competence = `${today.slice(0, 7)}-01`;
  return <><PageHeader title="Configurações" subtitle="Defina como seu salário entra no planejamento." /><div className="grid gap-8 lg:grid-cols-2"><section className="rounded-lg border bg-surface p-5"><h2 className="mb-1 text-lg font-semibold">Configuração de salário</h2><p className="mb-5 text-sm text-muted">Informe o total mensal e a conta que recebe o valor.</p>{!accounts?.length && <p className="mb-4 text-sm text-warning">Cadastre uma conta antes de configurar o salário.</p>}<SalarySettingForm accounts={accounts ?? []} setting={setting} /></section><section className="rounded-lg border bg-surface p-5"><h2 className="mb-1 text-lg font-semibold">Geração mensal</h2><p className="mb-5 text-sm text-muted">Confira as duas entradas antes de confirmar.</p>{setting ? <SalaryGeneration monthlyAmount={setting.monthly_amount} competence={competence} /> : <p className="text-sm text-muted">Salve a configuração para liberar a geração.</p>}</section></div><section className="mt-10 border-t pt-6 md:hidden"><h2 className="mb-3 font-semibold">Mais</h2><div className="space-y-1"><Link href="/cartoes" className="flex items-center gap-3 py-3"><CreditCard size={18} />Cartões</Link><Link href="/categorias" className="flex items-center gap-3 py-3"><FolderTree size={18} />Categorias</Link><form action={logoutAction}><button className="flex w-full items-center gap-3 py-3 text-negative"><LogOut size={18} />Sair</button></form></div></section></>;
}
