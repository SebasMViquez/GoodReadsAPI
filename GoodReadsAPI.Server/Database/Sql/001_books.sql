-- GoodReadsAPI Supabase bootstrap (Phase 1: books)
-- Run this in Supabase SQL editor.

  create table if not exists public.books (
      id text primary key,
      slug text not null unique,
      title jsonb not null,
      subtitle jsonb not null,
      author_id text not null,
      year integer not null,
      page_count integer not null,
      format jsonb not null,
      rating numeric(3,2) not null default 0,
      rating_count jsonb not null,
      description jsonb not null,
      short_description jsonb not null,
      quote jsonb not null,
      cover text not null,
      backdrop text not null,
      genres text[] not null default '{}',
      mood jsonb not null,
      accent text not null,
      shelves jsonb not null,
      friends_reading integer not null default 0,
      featured boolean not null default false,
      trending boolean not null default false,
      editor_pick boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
  );

  create index if not exists ix_books_year on public.books(year desc);
  create index if not exists ix_books_author_id on public.books(author_id);

  create or replace function public.set_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;

  drop trigger if exists trg_books_set_updated_at on public.books;
  create trigger trg_books_set_updated_at
  before update on public.books
  for each row
  execute function public.set_updated_at();

  -- RLS setup (recommended)
  alter table public.books enable row level security;

  -- For server-side service key usage, you can keep policies strict.
  -- Allow read/write via service role only (default behavior if no permissive policies).
