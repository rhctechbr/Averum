begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id),
  constraint profiles_id_user_id_key unique (id, user_id)
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  initial_balance numeric(14,2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_name_check check (name = btrim(name) and char_length(name) between 1 and 80),
  constraint accounts_type_check check (type in ('checking', 'savings', 'cash')),
  constraint accounts_id_user_id_key unique (id, user_id)
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  credit_limit numeric(14,2) not null,
  closing_day smallint not null,
  due_day smallint not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cards_name_check check (name = btrim(name) and char_length(name) between 1 and 80),
  constraint cards_credit_limit_check check (credit_limit > 0),
  constraint cards_closing_day_check check (closing_day between 1 and 28),
  constraint cards_due_day_check check (due_day between 1 and 28),
  constraint cards_color_check check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint cards_id_user_id_key unique (id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_check check (name = btrim(name) and char_length(name) between 1 and 80),
  constraint categories_type_check check (type in ('income', 'expense')),
  constraint categories_id_user_id_key unique (id, user_id),
  constraint categories_id_user_id_type_key unique (id, user_id, type)
);

create unique index categories_user_type_name_unique_idx
  on public.categories (user_id, type, lower(btrim(name)));

create table public.installment_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  total_amount numeric(14,2) not null,
  installments_count smallint not null,
  first_installment_date date not null,
  category_id uuid not null,
  category_type text not null default 'expense',
  account_id uuid,
  card_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint installment_groups_description_check check (
    description = btrim(description) and char_length(description) between 1 and 200
  ),
  constraint installment_groups_total_amount_check check (total_amount > 0),
  constraint installment_groups_nonzero_parts_check check (
    (total_amount * 100)::numeric >= installments_count
  ),
  constraint installment_groups_count_check check (installments_count between 2 and 60),
  constraint installment_groups_category_type_check check (category_type = 'expense'),
  constraint installment_groups_source_check check ((account_id is null) <> (card_id is null)),
  constraint installment_groups_id_user_id_key unique (id, user_id),
  constraint installment_groups_category_fk foreign key (category_id, user_id, category_type)
    references public.categories(id, user_id, type)
    on delete no action deferrable initially deferred,
  constraint installment_groups_account_fk foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete no action deferrable initially deferred,
  constraint installment_groups_card_fk foreign key (card_id, user_id)
    references public.cards(id, user_id)
    on delete no action deferrable initially deferred
);

create table public.salary_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  monthly_amount numeric(14,2) not null,
  account_id uuid not null,
  salary_category_id uuid not null,
  salary_category_type text not null default 'income',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salary_settings_user_id_key unique (user_id),
  constraint salary_settings_id_user_id_key unique (id, user_id),
  constraint salary_settings_monthly_amount_check check (monthly_amount >= 0.02),
  constraint salary_settings_category_type_check check (salary_category_type = 'income'),
  constraint salary_settings_account_fk foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete no action deferrable initially deferred,
  constraint salary_settings_category_fk foreign key (salary_category_id, user_id, salary_category_type)
    references public.categories(id, user_id, type)
    on delete no action deferrable initially deferred
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  amount numeric(14,2) not null,
  transaction_date date not null,
  description text not null,
  category_id uuid,
  category_type text,
  account_id uuid,
  card_id uuid,
  transfer_from_account_id uuid,
  transfer_to_account_id uuid,
  is_paid boolean not null,
  due_date date,
  installment_group_id uuid,
  installment_number smallint,
  installment_total smallint,
  salary_setting_id uuid,
  salary_competence date,
  salary_part smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_kind_check check (kind in ('income', 'expense', 'transfer')),
  constraint transactions_amount_check check (amount > 0),
  constraint transactions_description_check check (
    description = btrim(description) and char_length(description) between 1 and 220
  ),
  constraint transactions_category_type_check check (category_type is null or category_type in ('income', 'expense')),
  constraint transactions_shape_check check (
    (
      kind = 'income'
      and category_id is not null
      and category_type = 'income'
      and account_id is not null
      and card_id is null
      and transfer_from_account_id is null
      and transfer_to_account_id is null
      and installment_group_id is null
      and installment_number is null
      and installment_total is null
    )
    or
    (
      kind = 'expense'
      and category_id is not null
      and category_type = 'expense'
      and ((account_id is null) <> (card_id is null))
      and transfer_from_account_id is null
      and transfer_to_account_id is null
      and salary_setting_id is null
      and salary_competence is null
      and salary_part is null
      and (account_id is null or is_paid or due_date is not null)
      and (card_id is null or due_date is not null)
    )
    or
    (
      kind = 'transfer'
      and category_id is null
      and category_type is null
      and account_id is null
      and card_id is null
      and transfer_from_account_id is not null
      and transfer_to_account_id is not null
      and transfer_from_account_id <> transfer_to_account_id
      and is_paid
      and due_date is null
      and installment_group_id is null
      and installment_number is null
      and installment_total is null
      and salary_setting_id is null
      and salary_competence is null
      and salary_part is null
    )
  ),
  constraint transactions_installment_shape_check check (
    (
      installment_group_id is null
      and installment_number is null
      and installment_total is null
    )
    or
    (
      kind = 'expense'
      and installment_group_id is not null
      and installment_number between 1 and 60
      and installment_total between 2 and 60
      and installment_number <= installment_total
      and due_date = transaction_date
    )
  ),
  constraint transactions_salary_shape_check check (
    (
      salary_setting_id is null
      and salary_competence is null
      and salary_part is null
    )
    or
    (
      kind = 'income'
      and salary_setting_id is not null
      and salary_competence is not null
      and salary_competence = date_trunc('month', salary_competence)::date
      and salary_part in (40, 60)
    )
  ),
  constraint transactions_category_fk foreign key (category_id, user_id, category_type)
    references public.categories(id, user_id, type)
    on delete no action deferrable initially deferred,
  constraint transactions_account_fk foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete no action deferrable initially deferred,
  constraint transactions_card_fk foreign key (card_id, user_id)
    references public.cards(id, user_id)
    on delete no action deferrable initially deferred,
  constraint transactions_transfer_from_fk foreign key (transfer_from_account_id, user_id)
    references public.accounts(id, user_id)
    on delete no action deferrable initially deferred,
  constraint transactions_transfer_to_fk foreign key (transfer_to_account_id, user_id)
    references public.accounts(id, user_id)
    on delete no action deferrable initially deferred,
  constraint transactions_installment_group_fk foreign key (installment_group_id, user_id)
    references public.installment_groups(id, user_id)
    on delete cascade,
  constraint transactions_salary_setting_fk foreign key (salary_setting_id, user_id)
    references public.salary_settings(id, user_id)
    on delete no action deferrable initially deferred
);

create unique index transactions_salary_generation_unique_idx
  on public.transactions (salary_setting_id, salary_competence, salary_part)
  where salary_setting_id is not null;

create index profiles_user_id_idx on public.profiles(user_id);
create index accounts_user_id_idx on public.accounts(user_id);
create index cards_user_id_idx on public.cards(user_id);
create index categories_user_id_idx on public.categories(user_id);
create index installment_groups_user_id_idx on public.installment_groups(user_id);
create index installment_groups_category_id_idx on public.installment_groups(category_id);
create index installment_groups_account_id_idx on public.installment_groups(account_id);
create index installment_groups_card_id_idx on public.installment_groups(card_id);
create index salary_settings_user_id_idx on public.salary_settings(user_id);
create index salary_settings_account_id_idx on public.salary_settings(account_id);
create index salary_settings_category_id_idx on public.salary_settings(salary_category_id);
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_transaction_date_idx on public.transactions(transaction_date);
create index transactions_due_date_idx on public.transactions(due_date);
create index transactions_kind_idx on public.transactions(kind);
create index transactions_is_paid_idx on public.transactions(is_paid);
create index transactions_installment_group_id_idx on public.transactions(installment_group_id);
create index transactions_salary_setting_id_idx on public.transactions(salary_setting_id);
create index transactions_category_id_idx on public.transactions(category_id);
create index transactions_account_id_idx on public.transactions(account_id);
create index transactions_card_id_idx on public.transactions(card_id);
create index transactions_transfer_from_account_id_idx on public.transactions(transfer_from_account_id);
create index transactions_transfer_to_account_id_idx on public.transactions(transfer_to_account_id);
create index transactions_month_summary_idx on public.transactions(user_id, transaction_date, kind);
create index transactions_upcoming_due_idx on public.transactions(user_id, due_date)
  where kind = 'expense' and not is_paid and due_date is not null;
create index transactions_installment_commitment_idx on public.transactions(user_id, transaction_date)
  where kind = 'expense' and not is_paid and installment_group_id is not null;

create or replace function public.calculate_card_due_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  card_closing_day smallint;
  card_due_day smallint;
  closing_month date;
begin
  if new.kind = 'expense' and new.card_id is not null and new.installment_group_id is null then
    select c.closing_day, c.due_day
      into card_closing_day, card_due_day
    from public.cards as c
    where c.id = new.card_id and c.user_id = new.user_id;

    if not found then
      raise exception using errcode = '23503', message = 'Cartão inválido para o usuário.';
    end if;

    closing_month := date_trunc('month', new.transaction_date)::date;
    if extract(day from new.transaction_date)::integer > card_closing_day then
      closing_month := (closing_month + interval '1 month')::date;
    end if;

    if card_due_day > card_closing_day then
      new.due_date := closing_month + (card_due_day - 1);
    else
      new.due_date := (closing_month + interval '1 month')::date + (card_due_day - 1);
    end if;
  end if;

  if new.kind = 'transfer' and nullif(btrim(new.description), '') is null then
    new.description := 'Transferência';
  end if;

  return new;
end;
$$;

create or replace function public.guard_generated_transaction()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  deleting_group text;
begin
  if tg_op = 'DELETE' then
    if auth.uid() is null then
      return old;
    end if;

    if old.installment_group_id is not null then
      deleting_group := current_setting('cofrefluxo.deleting_installment_group', true);
      if deleting_group = old.installment_group_id::text then
        return old;
      end if;
    end if;

    if old.installment_group_id is not null or old.salary_setting_id is not null then
      raise exception using errcode = '23514', message = 'Lançamentos gerados não podem ser excluídos individualmente.';
    end if;

    return old;
  end if;

  if old.installment_group_id is not null or old.salary_setting_id is not null then
    if new.id is distinct from old.id
      or new.user_id is distinct from old.user_id
      or new.kind is distinct from old.kind
      or new.amount is distinct from old.amount
      or new.transaction_date is distinct from old.transaction_date
      or new.description is distinct from old.description
      or new.category_id is distinct from old.category_id
      or new.category_type is distinct from old.category_type
      or new.account_id is distinct from old.account_id
      or new.card_id is distinct from old.card_id
      or new.transfer_from_account_id is distinct from old.transfer_from_account_id
      or new.transfer_to_account_id is distinct from old.transfer_to_account_id
      or new.due_date is distinct from old.due_date
      or new.installment_group_id is distinct from old.installment_group_id
      or new.installment_number is distinct from old.installment_number
      or new.installment_total is distinct from old.installment_total
      or new.salary_setting_id is distinct from old.salary_setting_id
      or new.salary_competence is distinct from old.salary_competence
      or new.salary_part is distinct from old.salary_part
      or new.created_at is distinct from old.created_at
    then
      raise exception using errcode = '23514', message = 'Somente o status de pagamento pode ser alterado em lançamentos gerados.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.guard_installment_group_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and exists (
    select 1
    from public.transactions as t
    where t.installment_group_id = old.id
      and t.user_id = old.user_id
      and t.is_paid
  ) then
    raise exception using errcode = '23514', message = 'Parcelamento com parcela paga não pode ser excluído.';
  end if;

  perform set_config('cofrefluxo.deleting_installment_group', old.id::text, true);
  return old;
end;
$$;

create or replace function public.guard_salary_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.type = 'income' and old.name = 'Salário'
     and not exists (
       select 1 from public.salary_settings as s
       where s.salary_category_id = old.id and s.user_id = old.user_id
     )
     and (tg_op = 'DELETE' or new.name is distinct from old.name or new.type is distinct from old.type)
  then
    raise exception using errcode = '23514', message = 'Configure o salário antes de renomear esta categoria.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger transactions_10_calculate_card_due_date
before insert or update on public.transactions
for each row execute function public.calculate_card_due_date();

create trigger transactions_20_guard_generated
before update or delete on public.transactions
for each row execute function public.guard_generated_transaction();

create trigger installment_groups_10_guard_delete
before delete on public.installment_groups
for each row execute function public.guard_installment_group_delete();

create trigger categories_10_guard_salary
before update or delete on public.categories
for each row execute function public.guard_salary_category();

create trigger profiles_90_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger accounts_90_set_updated_at before update on public.accounts
for each row execute function public.set_updated_at();
create trigger cards_90_set_updated_at before update on public.cards
for each row execute function public.set_updated_at();
create trigger categories_90_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger transactions_90_set_updated_at before update on public.transactions
for each row execute function public.set_updated_at();
create trigger installment_groups_90_set_updated_at before update on public.installment_groups
for each row execute function public.set_updated_at();
create trigger salary_settings_90_set_updated_at before update on public.salary_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id) values (new.id);

  insert into public.categories (user_id, name, type)
  values
    (new.id, 'Moradia', 'expense'),
    (new.id, 'Alimentação', 'expense'),
    (new.id, 'Transporte', 'expense'),
    (new.id, 'Saúde', 'expense'),
    (new.id, 'Educação', 'expense'),
    (new.id, 'Lazer', 'expense'),
    (new.id, 'Assinaturas', 'expense'),
    (new.id, 'Compras', 'expense'),
    (new.id, 'Impostos e Taxas', 'expense'),
    (new.id, 'Outros', 'expense'),
    (new.id, 'Salário', 'income'),
    (new.id, 'Renda Extra', 'income'),
    (new.id, 'Reembolso', 'income'),
    (new.id, 'Outros', 'income');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.calculate_card_due_date() from public, anon, authenticated;
revoke all on function public.guard_generated_transaction() from public, anon, authenticated;
revoke all on function public.guard_installment_group_delete() from public, anon, authenticated;
revoke all on function public.guard_salary_category() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.accounts enable row level security;
alter table public.accounts force row level security;
alter table public.cards enable row level security;
alter table public.cards force row level security;
alter table public.categories enable row level security;
alter table public.categories force row level security;
alter table public.transactions enable row level security;
alter table public.transactions force row level security;
alter table public.installment_groups enable row level security;
alter table public.installment_groups force row level security;
alter table public.salary_settings enable row level security;
alter table public.salary_settings force row level security;

create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy profiles_delete_own on public.profiles for delete to authenticated
using ((select auth.uid()) = user_id);

create policy accounts_select_own on public.accounts for select to authenticated
using ((select auth.uid()) = user_id);
create policy accounts_insert_own on public.accounts for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy accounts_update_own on public.accounts for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy accounts_delete_own on public.accounts for delete to authenticated
using ((select auth.uid()) = user_id);

create policy cards_select_own on public.cards for select to authenticated
using ((select auth.uid()) = user_id);
create policy cards_insert_own on public.cards for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy cards_update_own on public.cards for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy cards_delete_own on public.cards for delete to authenticated
using ((select auth.uid()) = user_id);

create policy categories_select_own on public.categories for select to authenticated
using ((select auth.uid()) = user_id);
create policy categories_insert_own on public.categories for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy categories_update_own on public.categories for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy categories_delete_own on public.categories for delete to authenticated
using ((select auth.uid()) = user_id);

create policy transactions_select_own on public.transactions for select to authenticated
using ((select auth.uid()) = user_id);
create policy transactions_insert_own on public.transactions for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy transactions_update_own on public.transactions for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy transactions_delete_own on public.transactions for delete to authenticated
using ((select auth.uid()) = user_id);

create policy installment_groups_select_own on public.installment_groups for select to authenticated
using ((select auth.uid()) = user_id);
create policy installment_groups_insert_own on public.installment_groups for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy installment_groups_update_own on public.installment_groups for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy installment_groups_delete_own on public.installment_groups for delete to authenticated
using ((select auth.uid()) = user_id);

create policy salary_settings_select_own on public.salary_settings for select to authenticated
using ((select auth.uid()) = user_id);
create policy salary_settings_insert_own on public.salary_settings for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy salary_settings_update_own on public.salary_settings for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy salary_settings_delete_own on public.salary_settings for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.profiles from public, anon;
revoke all on table public.accounts from public, anon;
revoke all on table public.cards from public, anon;
revoke all on table public.categories from public, anon;
revoke all on table public.transactions from public, anon;
revoke all on table public.installment_groups from public, anon;
revoke all on table public.salary_settings from public, anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.accounts to authenticated;
grant select, insert, update, delete on table public.cards to authenticated;
grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;
grant select, insert, update, delete on table public.installment_groups to authenticated;
grant select, insert, update, delete on table public.salary_settings to authenticated;

commit;
