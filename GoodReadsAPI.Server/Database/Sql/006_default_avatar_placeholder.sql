-- GoodReadsAPI Supabase bootstrap (Phase 5: default avatar placeholder)
-- Run after:
--   005_supabase_auth_alignment.sql

-- Replace old default portrait avatar with neutral placeholder for existing rows.
update public.users
set avatar = 'https://api.dicebear.com/9.x/shapes/svg?seed=goodreads-reader'
where avatar in (
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
  ''
);

-- Ensure future auth-created users also receive the neutral placeholder.
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
    'https://api.dicebear.com/9.x/shapes/svg?seed=goodreads-reader',
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
