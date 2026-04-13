-- GoodReadsAPI Supabase bootstrap (Phase 4: auth alignment)
-- Run after:
--   001_books.sql
--   002_social_core.sql
-- Optional seeds:
--   003_authors_bulk_seed.sql
--   004_books_bulk_seed.sql

create extension if not exists pgcrypto;

alter table public.users
  add column if not exists auth_user_id uuid;

create unique index if not exists ux_users_auth_user_id
on public.users(auth_user_id)
where auth_user_id is not null;

-- Keep compatibility with existing text ids while allowing new profile ids by default.
alter table public.users
  alter column id set default gen_random_uuid()::text;

-- Backfill auth_user_id for rows that already share the same email with auth.users.
update public.users u
set auth_user_id = a.id
from auth.users a
where u.auth_user_id is null
  and u.email is not null
  and lower(u.email) = lower(a.email);

-- Insert missing app-profile rows for auth users that already existed before this script/trigger.
insert into public.users (
  id,
  auth_user_id,
  name,
  username,
  email,
  avatar,
  banner,
  role,
  bio,
  location,
  website,
  profile_visibility,
  followers_count,
  following_count,
  books_read,
  pages_read,
  streak,
  favorite_genres,
  badges
)
select
  a.id::text as id,
  a.id as auth_user_id,
  coalesce(
    nullif(trim(a.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(a.email, ''), '@', 1),
    ''
  ) as name,
  coalesce(
    nullif(lower(regexp_replace(a.raw_user_meta_data ->> 'username', '[^a-z0-9_-]', '', 'g')), ''),
    nullif(lower(regexp_replace(split_part(coalesce(a.email, ''), '@', 1), '[^a-z0-9_-]', '', 'g')), ''),
    'reader'
  ) || '-' || left(a.id::text, 8) as username,
  coalesce(a.email, '') as email,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80' as avatar,
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80' as banner,
  jsonb_build_object('en', '', 'es', '') as role,
  jsonb_build_object('en', '', 'es', '') as bio,
  '' as location,
  '' as website,
  'public' as profile_visibility,
  0 as followers_count,
  0 as following_count,
  0 as books_read,
  jsonb_build_object('en', '', 'es', '') as pages_read,
  0 as streak,
  '{}'::text[] as favorite_genres,
  '[]'::jsonb as badges
from auth.users a
where not exists (
  select 1
  from public.users u
  where u.auth_user_id = a.id
)
and not exists (
  select 1
  from public.users u
  where lower(u.email) = lower(coalesce(a.email, ''))
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  resolved_username text;
  candidate_name text;
  suffix integer := 0;
begin
  candidate_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    ''
  );

  base_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'reader-' || left(new.id::text, 8)
  );

  base_username := lower(regexp_replace(base_username, '[^a-z0-9_-]', '', 'g'));

  if base_username = '' then
    base_username := 'reader';
  end if;

  resolved_username := base_username;

  while exists (
    select 1
    from public.users u
    where u.username = resolved_username
      and u.auth_user_id is distinct from new.id
  ) loop
    suffix := suffix + 1;
    resolved_username := base_username || '-' || suffix::text;
  end loop;

  if exists (select 1 from public.users u where u.auth_user_id = new.id) then
    update public.users
    set
      email = coalesce(new.email, email),
      name = coalesce(nullif(candidate_name, ''), name),
      username = coalesce(nullif(resolved_username, ''), username),
      auth_user_id = new.id
    where auth_user_id = new.id;

    return new;
  end if;

  if exists (
    select 1
    from public.users u
    where lower(u.email) = lower(coalesce(new.email, ''))
  ) then
    update public.users
    set auth_user_id = new.id
    where lower(email) = lower(coalesce(new.email, ''));

    return new;
  end if;

  insert into public.users (
    id,
    auth_user_id,
    name,
    username,
    email,
    avatar,
    banner,
    role,
    bio,
    location,
    website,
    profile_visibility,
    followers_count,
    following_count,
    books_read,
    pages_read,
    streak,
    favorite_genres,
    badges
  ) values (
    new.id::text,
    new.id,
    candidate_name,
    resolved_username,
    coalesce(new.email, ''),
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    jsonb_build_object('en', '', 'es', ''),
    jsonb_build_object('en', '', 'es', ''),
    '',
    '',
    'public',
    0,
    0,
    0,
    jsonb_build_object('en', '', 'es', ''),
    0,
    '{}'::text[],
    '[]'::jsonb
  );

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.sync_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users
  set email = coalesce(new.email, email)
  where auth_user_id = new.id;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_email_updated on auth.users;
create trigger trg_on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.sync_auth_user_email();

-- Convenience helper for future RLS policies.
create or replace function public.current_app_user_id()
returns text
language sql
stable
as $$
  select u.id
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

-- NOTE:
-- public.user_accounts is now legacy for local mock auth only and should be phased out.
