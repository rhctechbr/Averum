begin;

create index installment_groups_account_user_idx on public.installment_groups(account_id, user_id);
create index installment_groups_card_user_idx on public.installment_groups(card_id, user_id);
create index installment_groups_category_user_type_idx on public.installment_groups(category_id, user_id, category_type);
create index salary_settings_account_user_idx on public.salary_settings(account_id, user_id);
create index salary_settings_category_user_type_idx on public.salary_settings(salary_category_id, user_id, salary_category_type);
create index transactions_account_user_idx on public.transactions(account_id, user_id);
create index transactions_card_user_idx on public.transactions(card_id, user_id);
create index transactions_category_user_type_idx on public.transactions(category_id, user_id, category_type);
create index transactions_installment_user_idx on public.transactions(installment_group_id, user_id);
create index transactions_salary_user_idx on public.transactions(salary_setting_id, user_id);
create index transactions_transfer_from_user_idx on public.transactions(transfer_from_account_id, user_id);
create index transactions_transfer_to_user_idx on public.transactions(transfer_to_account_id, user_id);

commit;
