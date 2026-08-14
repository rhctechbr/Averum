# CofreFluxo

Aplicativo web de finanças pessoais construído com Next.js, Supabase e PostgreSQL. O projeto prioriza isolamento multiusuário, integridade financeira, experiência responsiva e uma arquitetura direta, sem backend separado.

## Estado atual

A base do projeto contém:

- schema PostgreSQL com as sete tabelas da versão 1;
- RLS explícita e `FORCE ROW LEVEL SECURITY` em todas as tabelas;
- foreign keys compostas que impedem referências entre usuários;
- bootstrap de perfil e categorias padrão;
- proteções de parcelamento, salário e vencimento de cartão;
- testes pgTAP de RLS e integridade;
- tipos TypeScript gerados do Supabase;
- núcleo financeiro coberto por Vitest;
- infraestrutura Next.js, Supabase SSR, CSP e PWA segura.

As instruções completas de configuração, desenvolvimento e deploy serão consolidadas quando todas as telas e ações da versão 1 estiverem implementadas.

## Comandos

```bash
npm ci
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
```

Copie `.env.example` para `.env.local` e preencha somente as duas variáveis públicas do projeto Supabase.
