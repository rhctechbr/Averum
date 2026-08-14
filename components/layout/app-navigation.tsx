"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, FolderTree, House, Landmark, ListChecks, Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const main = [
  ["Visão Geral", "/dashboard", House],
  ["Lançamentos", "/lancamentos", ListChecks],
  ["Contas", "/contas", Landmark],
  ["Cartões", "/cartoes", CreditCard],
  ["Categorias", "/categorias", FolderTree],
  ["Relatórios", "/relatorios", BarChart3],
  ["Configurações", "/configuracoes", Settings],
] as const;

export function DesktopNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Navegação principal" className="space-y-1">{main.map(([label, href, Icon]) => <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-background hover:text-foreground", pathname === href && "bg-[#E8F0EC] text-primary")}><Icon size={18} />{label}</Link>)}</nav>;
}

const mobile = [
  ["Início", "/dashboard", House],
  ["Lançamentos", "/lancamentos", ListChecks],
  ["Contas", "/contas", Landmark],
  ["Relatórios", "/relatorios", BarChart3],
  ["Mais", "/configuracoes", Menu],
] as const;

export function MobileNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Navegação móvel" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-surface px-1 pb-[env(safe-area-inset-bottom)] md:hidden">{mobile.map(([label, href, Icon]) => <Link key={label} href={href} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted", pathname === href && "text-primary")}><Icon size={19} />{label}</Link>)}</nav>;
}
