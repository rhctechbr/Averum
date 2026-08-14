-- A policy DELETE própria precisa permanecer efetiva para todas as sete tabelas.
-- Estes comandos são idempotentes para ambientes criados diretamente pela migration inicial.
drop trigger if exists salary_settings_10_guard_delete on public.salary_settings;
drop function if exists public.guard_salary_setting_delete();
