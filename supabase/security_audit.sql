-- Supabase security audit script
-- Run this in Supabase SQL Editor.

-- 1) RLS status per table in public schema
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;

-- 2) Policies per table
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3) Tables in public with NO RLS (high risk if accessible via anon/authenticated)
select
  n.nspname as schema_name,
  c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = false
order by c.relname;

-- 4) Table privileges granted to anon/authenticated
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- 5) Optional: revoke broad grants pattern (edit table names before running)
-- revoke all on table public.your_table from anon;
-- revoke all on table public.your_table from authenticated;

-- 6) Example policy template for per-user ownership tables
-- Assumes table has column user_id uuid referencing auth.users.id
-- alter table public.your_table enable row level security;
--
-- create policy "users can read own rows"
-- on public.your_table
-- for select
-- to authenticated
-- using (auth.uid() = user_id);
--
-- create policy "users can insert own rows"
-- on public.your_table
-- for insert
-- to authenticated
-- with check (auth.uid() = user_id);
--
-- create policy "users can update own rows"
-- on public.your_table
-- for update
-- to authenticated
-- using (auth.uid() = user_id)
-- with check (auth.uid() = user_id);
--
-- create policy "users can delete own rows"
-- on public.your_table
-- for delete
-- to authenticated
-- using (auth.uid() = user_id);

-- 7) Example strict read-only public table (if intentionally public)
-- alter table public.public_reference enable row level security;
-- create policy "public read only"
-- on public.public_reference
-- for select
-- to anon, authenticated
-- using (true);
--
-- revoke insert, update, delete on public.public_reference from anon;
-- revoke insert, update, delete on public.public_reference from authenticated;
