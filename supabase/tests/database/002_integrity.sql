begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(35);
create temporary table tap_results (line text);
grant select, insert on tap_results to authenticated;

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'integrity-a@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'integrity-b@example.invalid');

update public.categories
set id = 'a0320000-0000-4000-8000-000000000001'
where user_id = '11111111-1111-4111-8111-111111111111' and type = 'income' and name = 'Salário';

insert into public.accounts (id, user_id, name, type)
values
  ('a0100000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Conta A', 'checking'),
  ('b0100000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Conta B', 'checking');

insert into public.cards (id, user_id, name, credit_limit, closing_day, due_day, color)
values
  ('a0200000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Cartão A', 1000, 10, 20, '#185C45'),
  ('a0210000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Cartão A 2', 1000, 20, 10, '#185C45'),
  ('b0200000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Cartão B', 1000, 10, 20, '#185C45');

insert into public.categories (id, user_id, name, type)
values
  ('a0300000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Despesa A', 'expense'),
  ('a0310000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Receita A', 'income'),
  ('b0300000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Despesa B', 'expense');

set constraints all immediate;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-14', 'Conta cruzada', 'a0300000-0000-4000-8000-000000000001', 'expense', 'b0100000-0000-4000-8000-000000000001', true)$$,
  '23503', null, 'transação A com conta B é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-14', 'Categoria cruzada', 'b0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001', true)$$,
  '23503', null, 'transação A com categoria B é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, card_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-14', 'Cartão cruzado', 'a0300000-0000-4000-8000-000000000001', 'expense', 'b0200000-0000-4000-8000-000000000001', false)$$,
  '23503', null, 'transação A com cartão B é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, transfer_from_account_id, transfer_to_account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'transfer', 10, date '2026-08-14', 'Transferência cruzada', 'a0100000-0000-4000-8000-000000000001', 'b0100000-0000-4000-8000-000000000001', true)$$,
  '23503', null, 'transferência A para conta B é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.salary_settings (user_id, monthly_amount, account_id, salary_category_id, salary_category_type) values ('11111111-1111-4111-8111-111111111111', 1000, 'b0100000-0000-4000-8000-000000000001', 'a0320000-0000-4000-8000-000000000001', 'income')$$,
  '23503', null, 'salário A com conta B é rejeitado'
));

insert into tap_results values (throws_ok(
  $$insert into public.installment_groups (user_id, description, total_amount, installments_count, first_installment_date, category_id, category_type, card_id) values ('11111111-1111-4111-8111-111111111111', 'Parcelamento cruzado', 20, 2, date '2026-08-14', 'a0300000-0000-4000-8000-000000000001', 'expense', 'b0200000-0000-4000-8000-000000000001')$$,
  '23503', null, 'parcelamento A com cartão B é rejeitado'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'income', 10, date '2026-08-14', 'Tipo inválido', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001', true)$$,
  '23514', null, 'receita com categoria de despesa é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-14', 'Tipo inválido', 'a0310000-0000-4000-8000-000000000001', 'income', 'a0100000-0000-4000-8000-000000000001', true)$$,
  '23514', null, 'despesa com categoria de receita é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, transfer_from_account_id, transfer_to_account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'transfer', 10, date '2026-08-14', 'Mesma conta', 'a0100000-0000-4000-8000-000000000001', 'a0100000-0000-4000-8000-000000000001', true)$$,
  '23514', null, 'transferência para a mesma conta é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, card_id, transfer_from_account_id, transfer_to_account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'transfer', 10, date '2026-08-14', 'Transferência com cartão', 'a0200000-0000-4000-8000-000000000001', 'a0100000-0000-4000-8000-000000000001', 'a0100000-0000-4000-8000-000000000001', true)$$,
  '23514', null, 'transferência com cartão é rejeitada'
));

insert into tap_results values (throws_ok(
  $$insert into public.installment_groups (user_id, description, total_amount, installments_count, first_installment_date, category_id, category_type, account_id) values ('11111111-1111-4111-8111-111111111111', 'Parcelas zeradas', 0.01, 2, date '2026-08-14', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001')$$,
  '23514', null, 'parcelamento que produziria parcela zero é rejeitado'
));

insert into tap_results values (throws_ok(
  $$insert into public.salary_settings (user_id, monthly_amount, account_id, salary_category_id, salary_category_type) values ('11111111-1111-4111-8111-111111111111', 0.01, 'a0100000-0000-4000-8000-000000000001', 'a0320000-0000-4000-8000-000000000001', 'income')$$,
  '23514', null, 'salário inferior a R$ 0,02 é rejeitado'
));

insert into tap_results values (results_eq(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, card_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-10', 'Antes do fechamento', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0200000-0000-4000-8000-000000000001', false) returning due_date$$,
  $$values (date '2026-08-20')$$,
  'compra até o fechamento vence no mês calculado'
));

insert into tap_results values (results_eq(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, card_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-11', 'Depois do fechamento', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0200000-0000-4000-8000-000000000001', false) returning due_date$$,
  $$values (date '2026-09-20')$$,
  'compra após o fechamento vence no ciclo seguinte'
));

insert into tap_results values (results_eq(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, card_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-10', 'Vencimento após mês do fechamento', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0210000-0000-4000-8000-000000000001', false) returning due_date$$,
  $$values (date '2026-09-10')$$,
  'due_day menor ou igual ao closing_day usa mês seguinte'
));

insert into tap_results values (throws_ok(
  $$insert into public.categories (user_id, name, type) values ('11111111-1111-4111-8111-111111111111', 'alimentação', 'expense')$$,
  '23505', null, 'nome de categoria é único por usuário e tipo sem diferenciar caixa'
));

insert into tap_results values (throws_ok(
  $$update public.categories set name = 'Remuneração' where id = 'a0320000-0000-4000-8000-000000000001'$$,
  '23514', 'Configure o salário antes de renomear esta categoria.',
  'categoria Salário não pode ser renomeada antes da configuração'
));

insert into tap_results values (lives_ok(
  $$insert into public.salary_settings (id, user_id, monthly_amount, account_id, salary_category_id, salary_category_type) values ('a6000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 1000, 'a0100000-0000-4000-8000-000000000001', 'a0320000-0000-4000-8000-000000000001', 'income')$$,
  'configuração salarial válida é aceita'
));

insert into tap_results values (lives_ok(
  $$update public.categories set name = 'Remuneração' where id = 'a0320000-0000-4000-8000-000000000001'$$,
  'categoria salarial referenciada pode ser renomeada'
));

insert into public.installment_groups (
  id, user_id, description, total_amount, installments_count,
  first_installment_date, category_id, category_type, account_id
)
values
  ('a7000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Pago', 10, 2, date '2026-08-14', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001'),
  ('a7100000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Pendente', 10, 2, date '2026-08-14', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001');

insert into public.transactions (
  id, user_id, kind, amount, transaction_date, description,
  category_id, category_type, account_id, is_paid, due_date,
  installment_group_id, installment_number, installment_total
)
values
  ('a7010000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'expense', 5, date '2026-08-14', 'Pago — 1/2', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001', true, date '2026-08-14', 'a7000000-0000-4000-8000-000000000001', 1, 2),
  ('a7110000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'expense', 5, date '2026-08-14', 'Pendente — 1/2', 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001', false, date '2026-08-14', 'a7100000-0000-4000-8000-000000000001', 1, 2);

insert into tap_results values (throws_ok(
  $$delete from public.installment_groups where id = 'a7000000-0000-4000-8000-000000000001'$$,
  '23514', 'Parcelamento com parcela paga não pode ser excluído.',
  'grupo com parcela paga não pode ser excluído'
));

insert into tap_results values (lives_ok(
  $$delete from public.installment_groups where id = 'a7100000-0000-4000-8000-000000000001'$$,
  'grupo sem parcela paga pode ser excluído'
));

insert into tap_results values (is(
  (select count(*) from public.transactions where id = 'a7110000-0000-4000-8000-000000000001'),
  0::bigint,
  'excluir grupo permitido remove suas parcelas'
));

insert into tap_results values (lives_ok(
  $$insert into public.transactions (id, user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid, salary_setting_id, salary_competence, salary_part) values ('a8000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'income', 400, date '2026-08-15', 'Salário — 40%', 'a0320000-0000-4000-8000-000000000001', 'income', 'a0100000-0000-4000-8000-000000000001', false, 'a6000000-0000-4000-8000-000000000001', date '2026-08-01', 40)$$,
  'primeira parte salarial é criada'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid, salary_setting_id, salary_competence, salary_part) values ('11111111-1111-4111-8111-111111111111', 'income', 400, date '2026-08-15', 'Salário — 40%', 'a0320000-0000-4000-8000-000000000001', 'income', 'a0100000-0000-4000-8000-000000000001', false, 'a6000000-0000-4000-8000-000000000001', date '2026-08-01', 40)$$,
  '23505', null, 'geração salarial duplicada é rejeitada'
));

insert into tap_results values (throws_ok(
  $$update public.transactions set amount = 401 where id = 'a8000000-0000-4000-8000-000000000001'$$,
  '23514', 'Somente o status de pagamento pode ser alterado em lançamentos gerados.',
  'valor de salário gerado é imutável'
));

insert into tap_results values (lives_ok(
  $$update public.transactions set is_paid = true where id = 'a8000000-0000-4000-8000-000000000001'$$,
  'status de salário gerado pode ser alterado'
));

insert into tap_results values (throws_ok(
  $$delete from public.transactions where id = 'a8000000-0000-4000-8000-000000000001'$$,
  '23514', 'Lançamentos gerados não podem ser excluídos individualmente.',
  'salário gerado não pode ser excluído individualmente'
));

insert into tap_results values (throws_ok(
  $$insert into public.transactions (user_id, kind, amount, transaction_date, description, category_id, category_type, account_id, is_paid) values ('11111111-1111-4111-8111-111111111111', 'expense', 10, date '2026-08-14', repeat('x', 221), 'a0300000-0000-4000-8000-000000000001', 'expense', 'a0100000-0000-4000-8000-000000000001', true)$$,
  '23514', null, 'descrição de lançamento respeita limite de 220 caracteres'
));

insert into tap_results values (lives_ok(
  $$select public.create_installment_plan('RPC', 100.00, 3::smallint, date '2026-01-31', 'a0300000-0000-4000-8000-000000000001'::uuid, 'a0100000-0000-4000-8000-000000000001'::uuid, null::uuid)$$,
  'função cria parcelamento atomicamente'
));
insert into tap_results values (is(
  (select count(*) from public.transactions where description like 'RPC — %'), 3::bigint,
  'função cria todas as parcelas'
));
insert into tap_results values (is(
  (select sum(amount) from public.transactions where description like 'RPC — %'), 100.00::numeric,
  'parcelas preservam o total exato'
));
insert into tap_results values (results_eq(
  $$select transaction_date from public.transactions where description like 'RPC — %' order by installment_number$$,
  $$values (date '2026-01-31'), (date '2026-02-28'), (date '2026-03-31')$$,
  'parcelas retornam ao dia original após mês curto'
));
insert into tap_results values (lives_ok(
  $$select public.generate_salary_month(date '2026-09-01')$$,
  'função gera as duas partes do salário'
));
insert into tap_results values (is(
  (select count(*) from public.transactions where salary_competence = date '2026-09-01'), 2::bigint,
  'salário gera exatamente duas transações'
));
insert into tap_results values (throws_ok(
  $$select public.generate_salary_month(date '2026-09-01')$$,
  '23505', 'salary already generated', 'geração salarial por RPC é idempotente'
));

select line from tap_results union all select * from finish();
rollback;
