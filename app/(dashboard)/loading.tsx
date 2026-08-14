export default function Loading() {
  return <div aria-live="polite" className="space-y-5"><div className="h-8 w-48 animate-pulse rounded bg-border" /><div className="h-32 animate-pulse rounded bg-border" /><div className="grid grid-cols-2 gap-5"><div className="h-24 animate-pulse rounded bg-border" /><div className="h-24 animate-pulse rounded bg-border" /></div><span className="sr-only">Carregando…</span></div>;
}
