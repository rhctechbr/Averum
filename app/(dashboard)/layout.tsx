import { LogOut } from "lucide-react";
import { DesktopNavigation, MobileNavigation } from "@/components/layout/app-navigation";
import { logoutAction } from "@/lib/actions/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] border-r bg-surface px-4 py-7 md:flex md:flex-col">
        <div className="mb-9 px-3"><p className="text-xl font-bold tracking-tight text-primary">Averum</p><p className="mt-1 text-xs text-muted">Finanças pessoais</p></div>
        <DesktopNavigation />
        <form action={logoutAction} className="mt-auto"><button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-background hover:text-foreground"><LogOut size={18} />Sair</button></form>
      </aside>
      <main className="min-w-0 px-5 pb-24 pt-7 md:col-start-2 md:px-8 md:pb-10 lg:px-12"><div className="mx-auto max-w-[1440px]">{children}</div></main>
      <MobileNavigation />
    </div>
  );
}
