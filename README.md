# Averum

Averum é uma aplicação web responsiva para finanças pessoais. A V1 reúne contas, cartões, categorias, lançamentos, transferências, compras parceladas, planejamento de salário, dashboard e relatórios em uma interface pt-BR. O projeto prioriza precisão em centavos, isolamento multiusuário e integridade no banco.

## Stack e arquitetura

- Next.js 15 com App Router, React 19, TypeScript estrito e Tailwind CSS;
- Server Components para leitura e Server Actions para todas as mutações;
- Supabase Auth, PostgreSQL e Row Level Security;
- Zod na entrada, Recharts nos relatórios, Vitest e pgTAP nos testes;
- PWA instalável com cache somente de arquivos estáticos;
- deploy como Web Service Node.js no Render.

Existem exatamente sete tabelas públicas: `profiles`, `accounts`, `cards`, `categories`, `transactions`, `installment_groups` e `salary_settings`. Parcelamentos e salário são gerados por funções PostgreSQL `SECURITY INVOKER`, dentro da transação e sob a identidade autenticada. Nenhuma chave `service_role` é usada.

## Requisitos e instalação

- Node.js 22 ou superior;
- npm 10 ou superior;
- projeto Supabase;
- Supabase CLI para migrations e pgTAP local.

```bash
git clone https://github.com/rhctechbr/Averum.git
cd Averum
npm ci
cp .env.example .env.local
```

Preencha apenas as variáveis públicas:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICAVEL
```

Não adicione `service_role` à aplicação. O `.env.local` não deve ser versionado.

## Supabase e autenticação

1. Crie um projeto no Supabase.
2. Em Authentication → Providers, habilite Email.
3. Defina se a confirmação de e-mail será obrigatória. Em produção ela é recomendada; enquanto não confirmar, o usuário não inicia sessão.
4. Em Authentication → URL Configuration, configure a URL do site e os redirects `http://localhost:3000/**` e `https://SEU-SERVICO.onrender.com/**`.
5. Vincule o projeto e aplique o schema:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

As migrations criam tabelas, restrições, índices, triggers, RLS, categorias padrão e funções atômicas. Para atualizar os tipos após mudar o schema:

```bash
npx supabase gen types typescript --linked --schema public > types/database.ts
```

## Desenvolvimento, testes e build

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm audit --audit-level=high
```

Testes do banco:

```bash
npx supabase start
npx supabase test db
```

O pgTAP cobre RLS e isolamento entre usuários nas sete tabelas, formatos, referências cruzadas, parcelamentos, salário e exclusões. O Vitest cobre centavos, parcelas, datas, salário, transferências, saldos e vencimento de cartão. Para validar o artefato de produção localmente, use `npm run build && npm start`.

## Deploy no Render

Crie um **Web Service**, conecte `rhctechbr/Averum` e use:

- Runtime: Node;
- Build Command: `npm ci && npm run build`;
- Start Command: `npm run start`;
- variáveis: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Depois do primeiro deploy, inclua a URL final nos redirects do Supabase Auth. Aplique migrations separadamente com a Supabase CLI; não as execute no start do servidor.

## Segurança, RLS e backups

- RLS e `FORCE ROW LEVEL SECURITY` protegem todas as tabelas;
- políticas usam `auth.uid()` e restringem cada operação ao proprietário;
- foreign keys compostas impedem referências entre usuários;
- relações internas usam exclusão restritiva e constraints adiáveis, exceto o cascade controlado entre grupo e parcelas;
- grupo parcelado não pode ser excluído se houver parcela paga;
- lançamentos gerados permitem alterar somente `is_paid`;
- CSP com nonce e headers defensivos são emitidos pelo middleware;
- valores são calculados em centavos;
- o service worker não guarda páginas, APIs nem dados financeiros.

Backups e restaurações são responsabilidade operacional do Supabase. Habilite Point-in-Time Recovery quando o plano permitir, mantenha migrations versionadas, faça exportações periódicas criptografadas e teste a restauração em ambiente separado. Nunca use backup de produção em desenvolvimento sem anonimização.

## Limitações conhecidas da V1

- não possui Open Finance;
- cartão não possui entidade de fatura;
- pagamento de cartão não afeta automaticamente o saldo bancário;
- limite de cartão não é bloqueante;
- salário não utiliza cron: o usuário confirma a geração mensal;
- PWA não oferece lançamentos offline;
- não possui anexos;
- não possui compartilhamento;
- não possui IA.

Essas limitações são decisões explícitas de escopo da primeira versão.
