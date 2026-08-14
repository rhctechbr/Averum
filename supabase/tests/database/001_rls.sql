begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(63);

create temporary table tap_results (line text);
grant select, insert on tap_results to authenticated;

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'rls-a@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'rls-b@example.invalid'),
  ('33333333-3333-4333-8333-333333333333', 'rls-c@example.invalid');

delete from public.profiles
where user_id in (
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333333'
);

update public.profiles
set id = 'b0000000-0000-4000-8000-000000000001'
where user_id = '22222222-2222-4222-8222-222222222222';

insert into public.accounts (id, user_id, name, type)
values
  ('a0100000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Referência A', 'checking'),
  ('b0100000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Referência B', 'checking'),
  ('c0100000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Referência C', 'checking'),
  ('b1000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Registro B', 'cash');

insert into public.cards (id, user_id, name, credit_limit, closing_day, due_day, color)
values
  ('a0200000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Referência A', 1000, 10, 20, '#185C45'),
  ('b0200000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Referência B', 1000, 10, 20, '#185C45'),
  ('c0200000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Referência C', 1000, 10, 20, '#185C45'),
  ('b2000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Registro B', 500, 5, 15, '#161A17');

insert into public.categories (id, user_id, name, type)
values
  ('a0300000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Referência A', 'expense'),
  ('b0300000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Referência B', 'expense'),
  ('c0300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Referência C', 'expense'),
  ('b3000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Registro B', 'expense');

insert into public.transactions (
  id, user_id, kind, amount, transaction_date, description,
  category_id, category_type, account_id, is_paid
)
values (
  'b4000000-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222222',
  'expense', 10, date '2026-08-14', 'Registro B',
  'b0300000-0000-4000-8000-000000000001', 'expense',
  'b0100000-0000-4000-8000-000000000001', true
);

insert into public.installment_groups (
  id, user_id, description, total_amount, installments_count,
  first_installment_date, category_id, category_type, account_id
)
values (
  'b5000000-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222222',
  'Registro B', 20, 2, date '2026-08-14',
  'b0300000-0000-4000-8000-000000000001', 'expense',
  'b0100000-0000-4000-8000-000000000001'
);

insert into public.salary_settings (
  id, user_id, monthly_amount, account_id, salary_category_id, salary_category_type
)
values (
  'b6000000-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222222',
  1000,
  'b0100000-0000-4000-8000-000000000001',
  (select id from public.categories where user_id = '22222222-2222-4222-8222-222222222222' and type = 'income' and name = 'Salário'),
  'income'
);

create or replace function pg_temp.rls_contract(
  target_table text,
  own_insert_sql text,
  foreign_insert_sql text,
  own_id uuid,
  other_id uuid,
  foreign_user_id uuid
)
returns setof text
language plpgsql
as $$
begin
  return next lives_ok(own_insert_sql, target_table || ': INSERT próprio permitido');
  return next results_eq(
    format('select id from public.%I where id = %L::uuid', target_table, own_id),
    format('values (%L::uuid)', own_id),
    target_table || ': SELECT próprio permitido'
  );
  return next results_eq(
    format('select id from public.%I where id = %L::uuid', target_table, other_id),
    'select null::uuid where false',
    target_table || ': SELECT de outro usuário negado'
  );
  return next throws_ok(
    foreign_insert_sql,
    '42501',
    format('new row violates row-level security policy for table "%s"', target_table),
    target_table || ': INSERT com user_id alheio negado'
  );
  return next results_eq(
    format('update public.%I set updated_at = updated_at where id = %L::uuid returning id', target_table, own_id),
    format('values (%L::uuid)', own_id),
    target_table || ': UPDATE próprio permitido'
  );
  return next results_eq(
    format('update public.%I set updated_at = updated_at where id = %L::uuid returning id', target_table, other_id),
    'select null::uuid where false',
    target_table || ': UPDATE de outro usuário negado'
  );
  return next throws_ok(
    format('update public.%I set user_id = %L::uuid where id = %L::uuid', target_table, foreign_user_id, own_id),
    '42501',
    format('new row violates row-level security policy for table "%s"', target_table),
    target_table || ': troca de user_id negada'
  );
  return next results_eq(
    format('delete from public.%I where id = %L::uuid returning id', target_table, own_id),
    format('values (%L::uuid)', own_id),
    target_table || ': DELETE próprio permitido'
  );
  return next results_eq(
    format('delete from public.%I where id = %L::uuid returning id', target_table, other_id),
    'select null::uuid where false',
    target_table || ': DELETE de outro usuário negado'
  );
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

insert into tap_results select * from pg_temp.rls_contract(
  'profiles',
  $$insert into public.profiles (id, user_id) values ('a0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111')$$,
  $$insert into public.profiles (id, user_id) values ('c0000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333')$$,
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333'
);

insert into tap_results select * from pg_temp.rls_contract(
  'accounts',
  $$insert into public.accounts (id, user_id, name, type) values ('a1000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Registro A', 'cash')$$,
  $$insert into public.accounts (id, user_id, name, type) values ('c1000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Tentativa C', 'cash')$$,
  'a1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333'
);

insert into tap_results select * from pg_temp.rls_contract(
  'cards',
  $$insert into public.cards (id, user_id, name, credit_limit, closing_day, due_day, color) values ('a2000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Registro A', 500, 5, 15, '#161A17')$$,
  $$insert into public.cards (id, user_id, name, credit_limit, closing_day, due_day, color) values ('c2000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Tentativa C', 500, 5, 15, '#161A17')$$,
  'a2000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333'
);

insert into tap_results select * from pg_temp.rls_contract(
  'categories',
  $$insert into public.categories (id, user_id, name, type) values ('a3000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Registro A', 'expense')$$,
  $$insert into public.categories (id, user_id, name, type) values ('c3000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Tentativa C', 'expense')$$,
  'a3000000-0000-4000-8000-000000000001',
  'b3000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333'
);

insert into tap_results select * from pg_temp.rls_contract(
  'transactions',
  $$insert into public.transactions (id, user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid) values ('a4000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-14', 'Registro A', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001', true)$$,
  $$insert into public.transactions (id, user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid) values ('c4000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'expense', 10, date '2026-08-14', 'Tentativa C', 'c0300000-0000-4000-8000-000000000001', 'expense', 'c0100000-0000-4000-8000-000000000001', true)$$,
  'a4000000-0000-4000-8000-000000000001',
  'b4000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333'
);

insert into tap_results select * from pg_temp.rls_contract(
  'installment_groups',
  $$insert into public.installment_groups (id, user_id, description, total_amount, installments_count, first_installment_date, category_id, category_type, account_id) values ('a5000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Registro A', 20, 2, date '2026-08-14', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001')$$,
  $$insert into public.installment_groups (id, user_id, description, total_amount, installments_count, first_installment_date, category_id, category_type, account_id) values ('c5000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Tentativa C', 20, 2, date '2026-08-14', 'c0300000-0000-4000-8000-000000000001', 'expense', 'c0100000-0000-4000-8000-000000000001')$$,
  'a5000000-0000-4000-8000-000000000001',
  'b5000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333'
);

insert into tap_results select * from pg_temp.rls_contract(
  'salary_settings',
  $$insert into public.salary_settings (id, user_id, monthly_amount, account_id, salary_category_id, salary_category_type) values ('a6000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 1000, 'a0100000-0000-4000-8000-000000000001', (select id from public.categories where user_id = '11111111-1111-4111-8111-111111111111' and type = 'income' and name = 'Salário'), 'income')$$,
  $$insert into public.salary_settings (id, user_id, monthly_amount, account_id, salary_category_id, salary_category_type) values ('c6000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 1000, 'c0100000-0000-4000-8000-000000000001', (select id from public.categories where user_id = '33333333-3333-4333-8333-333333333333' and type = 'income' and name = 'Salário'), 'income')$$,
  'a6000000-0000-4000-8000-000000000001',
  'b6000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333'
);

select line from tap_results union all select * from finish();
rollback;
