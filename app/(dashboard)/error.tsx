"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-lg py-20 text-center"><h1 className="text-2xl font-semibold">Algo saiu do esperado</h1><p className="mb-6 mt-2 text-muted">Não foi possível carregar esta área. Seus dados não foram alterados.</p><Button onClick={reset}>Tentar novamente</Button></div>;
}
