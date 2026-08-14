export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <p className="text-xl font-bold tracking-tight">Averum</p>
        <div className="max-w-lg"><p className="text-4xl font-semibold leading-tight">Sua vida financeira, organizada com clareza.</p><p className="mt-5 text-white/75">Acompanhe contas, compromissos e fluxo salarial sem ruído.</p></div>
        <p className="text-sm text-white/60">Privacidade desde a primeira linha.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12"><div className="w-full max-w-[410px]">{children}</div></section>
    </main>
  );
}
