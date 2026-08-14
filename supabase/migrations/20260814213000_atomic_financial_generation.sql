begin;

create or replace function public.create_installment_plan(
  p_description text,
  p_total_amount numeric,
  p_installments_count smallint,
  p_first_installment_date date,
  p_category_id uuid,
  p_account_id uuid default null,
  p_card_id uuid default null
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_group_id uuid;
  v_total_cents bigint;
  v_base_cents bigint;
  v_remainder bigint;
  v_original_day integer;
  v_month date;
  v_date date;
  v_number integer;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  v_total_cents := round(p_total_amount * 100);
  if v_total_cents < p_installments_count then raise exception 'installments cannot be zero' using errcode = '22023'; end if;

  insert into public.installment_groups (
    user_id, description, total_amount, installments_count, first_installment_date,
    category_id, category_type, account_id, card_id
  ) values (
    v_user_id, btrim(p_description), p_total_amount, p_installments_count, p_first_installment_date,
    p_category_id, 'expense', p_account_id, p_card_id
  ) returning id into v_group_id;

  v_base_cents := v_total_cents / p_installments_count;
  v_remainder := v_total_cents % p_installments_count;
  v_original_day := extract(day from p_first_installment_date);

  for v_number in 1..p_installments_count loop
    v_month := (date_trunc('month', p_first_installment_date) + make_interval(months => v_number - 1))::date;
    v_date := make_date(
      extract(year from v_month)::integer,
      extract(month from v_month)::integer,
      least(v_original_day, extract(day from (v_month + interval '1 month - 1 day'))::integer)
    );
    insert into public.transactions (
      user_id, kind, amount, transaction_date, description, category_id, category_type,
      account_id, card_id, is_paid, due_date, installment_group_id,
      installment_number, installment_total
    ) values (
      v_user_id, 'expense',
      (v_base_cents + case when v_number <= v_remainder then 1 else 0 end) / 100.0,
      v_date, btrim(p_description) || ' — ' || v_number || '/' || p_installments_count,
      p_category_id, 'expense', p_account_id, p_card_id, false, v_date,
      v_group_id, v_number, p_installments_count
    );
  end loop;
  return v_group_id;
end;
$$;

create or replace function public.generate_salary_month(p_competence date)
returns smallint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_setting public.salary_settings%rowtype;
  v_competence date := date_trunc('month', p_competence)::date;
  v_total_cents bigint;
  v_first_cents bigint;
  v_second_date date;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into strict v_setting from public.salary_settings where user_id = v_user_id;
  v_total_cents := round(v_setting.monthly_amount * 100);
  v_first_cents := round(v_total_cents * 0.40);
  v_second_date := make_date(
    extract(year from v_competence)::integer,
    extract(month from v_competence)::integer,
    least(30, extract(day from (v_competence + interval '1 month - 1 day'))::integer)
  );

  insert into public.transactions (
    user_id, kind, amount, transaction_date, description, category_id, category_type,
    account_id, is_paid, salary_setting_id, salary_competence, salary_part
  ) values
    (v_user_id, 'income', v_first_cents / 100.0, v_competence + 14, 'Salário — 40%',
      v_setting.salary_category_id, 'income', v_setting.account_id, false, v_setting.id, v_competence, 40),
    (v_user_id, 'income', (v_total_cents - v_first_cents) / 100.0, v_second_date, 'Salário — 60%',
      v_setting.salary_category_id, 'income', v_setting.account_id, false, v_setting.id, v_competence, 60);
  return 2;
exception
  when unique_violation then
    raise exception 'salary already generated' using errcode = '23505';
end;
$$;

revoke all on function public.create_installment_plan(text, numeric, smallint, date, uuid, uuid, uuid) from public, anon;
grant execute on function public.create_installment_plan(text, numeric, smallint, date, uuid, uuid, uuid) to authenticated;
revoke all on function public.generate_salary_month(date) from public, anon;
grant execute on function public.generate_salary_month(date) to authenticated;

commit;
