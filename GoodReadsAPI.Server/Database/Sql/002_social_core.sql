-- GoodReadsAPI Supabase bootstrap (Phase 2: social core)
-- Run after 001_books.sql

create table if not exists public.authors (
    id text primary key,
    name text not null,
    portrait text not null,
    location text not null,
    short_bio jsonb not null,
    notable_work jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.users (
    id text primary key,
    name text not null,
    username text not null unique,
    email text not null unique,
    avatar text not null,
    banner text not null,
    role jsonb not null,
    bio jsonb not null,
    location text not null default '',
    website text not null default '',
    profile_visibility text not null default 'public' check (profile_visibility in ('public', 'private')),
    followers_count integer not null default 0,
    following_count integer not null default 0,
    books_read integer not null default 0,
    pages_read jsonb not null,
    streak integer not null default 0,
    favorite_genres text[] not null default '{}',
    badges jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.user_accounts (
    user_id text primary key references public.users(id) on delete cascade,
    email text not null unique,
    password_hash text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.user_follows (
    follower_id text not null references public.users(id) on delete cascade,
    followed_id text not null references public.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (follower_id, followed_id),
    check (follower_id <> followed_id)
);

create table if not exists public.follow_requests (
    id text primary key,
    requester_id text not null references public.users(id) on delete cascade,
    target_user_id text not null references public.users(id) on delete cascade,
    status text not null check (status in ('pending', 'accepted', 'declined')),
    created_at timestamptz not null default now(),
    responded_at timestamptz,
    check (requester_id <> target_user_id)
);

create unique index if not exists ux_follow_requests_pending
on public.follow_requests(requester_id, target_user_id)
where status = 'pending';

create table if not exists public.user_book_library (
    user_id text not null references public.users(id) on delete cascade,
    book_id text not null references public.books(id) on delete cascade,
    shelf_status text not null check (shelf_status in ('want-to-read', 'currently-reading', 'read')),
    progress integer not null default 0 check (progress >= 0 and progress <= 100),
    is_favorite boolean not null default false,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    primary key (user_id, book_id)
);

create table if not exists public.reviews (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    book_id text not null references public.books(id) on delete cascade,
    rating numeric(3,2) not null check (rating >= 0 and rating <= 5),
    title jsonb not null,
    excerpt jsonb not null,
    body jsonb not null,
    likes_count integer not null default 0,
    comments_count integer not null default 0,
    featured boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists ux_reviews_user_book
on public.reviews(user_id, book_id);

create table if not exists public.review_likes (
    review_id text not null references public.reviews(id) on delete cascade,
    user_id text not null references public.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (review_id, user_id)
);

create table if not exists public.review_comments (
    id text primary key,
    review_id text not null references public.reviews(id) on delete cascade,
    user_id text not null references public.users(id) on delete cascade,
    body text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.activities (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    type text not null check (type in ('finished', 'review', 'started', 'favorite', 'follow', 'shelf')),
    content jsonb not null,
    book_id text references public.books(id) on delete set null,
    target_user_id text references public.users(id) on delete set null,
    likes_count integer not null default 0,
    comments_count integer not null default 0,
    timestamp_utc timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.activity_likes (
    activity_id text not null references public.activities(id) on delete cascade,
    user_id text not null references public.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (activity_id, user_id)
);

create table if not exists public.activity_comments (
    id text primary key,
    activity_id text not null references public.activities(id) on delete cascade,
    user_id text not null references public.users(id) on delete cascade,
    body text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.conversations (
    id text primary key,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
    conversation_id text not null references public.conversations(id) on delete cascade,
    user_id text not null references public.users(id) on delete cascade,
    joined_at timestamptz not null default now(),
    primary key (conversation_id, user_id)
);

create table if not exists public.messages (
    id text primary key,
    conversation_id text not null references public.conversations(id) on delete cascade,
    sender_id text not null references public.users(id) on delete cascade,
    body text not null,
    status text not null check (status in ('sent', 'seen')),
    created_at timestamptz not null default now()
);

create table if not exists public.notifications (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    type text not null check (type in ('message', 'follow', 'activity', 'follow-request', 'request-approved')),
    actor_user_id text references public.users(id) on delete set null,
    book_id text references public.books(id) on delete set null,
    request_id text references public.follow_requests(id) on delete set null,
    message text,
    read boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
    user_id text primary key references public.users(id) on delete cascade,
    privacy jsonb not null,
    notifications jsonb not null,
    appearance jsonb not null,
    language jsonb not null,
    reading jsonb not null,
    security jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists ix_books_author_id on public.books(author_id);
create index if not exists ix_users_username on public.users(username);
create index if not exists ix_users_email on public.users(email);
create index if not exists ix_user_follows_followed on public.user_follows(followed_id);
create index if not exists ix_user_book_library_user_shelf on public.user_book_library(user_id, shelf_status);
create index if not exists ix_user_book_library_book on public.user_book_library(book_id);
create index if not exists ix_reviews_book on public.reviews(book_id);
create index if not exists ix_reviews_user on public.reviews(user_id);
create index if not exists ix_review_comments_review on public.review_comments(review_id, created_at desc);
create index if not exists ix_activities_user_time on public.activities(user_id, timestamp_utc desc);
create index if not exists ix_activities_time on public.activities(timestamp_utc desc);
create index if not exists ix_messages_conversation_time on public.messages(conversation_id, created_at asc);
create index if not exists ix_notifications_user_time on public.notifications(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- updated_at triggers

drop trigger if exists trg_authors_set_updated_at on public.authors;
create trigger trg_authors_set_updated_at
before update on public.authors
for each row execute function public.set_updated_at();

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_accounts_set_updated_at on public.user_accounts;
create trigger trg_user_accounts_set_updated_at
before update on public.user_accounts
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_book_library_set_updated_at on public.user_book_library;
create trigger trg_user_book_library_set_updated_at
before update on public.user_book_library
for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_set_updated_at on public.reviews;
create trigger trg_reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists trg_activities_set_updated_at on public.activities;
create trigger trg_activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

drop trigger if exists trg_conversations_set_updated_at on public.conversations;
create trigger trg_conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_settings_set_updated_at on public.user_settings;
create trigger trg_user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

-- Keep books.author_id linked to authors if possible.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'books'
  ) then
    begin
      alter table public.books
      add constraint fk_books_author
      foreign key (author_id) references public.authors(id) on delete restrict not valid;
    exception
      when duplicate_object then
        null;
    end;
  end if;
end $$;

-- RLS (service role still bypasses RLS)
alter table public.authors enable row level security;
alter table public.users enable row level security;
alter table public.user_accounts enable row level security;
alter table public.user_follows enable row level security;
alter table public.follow_requests enable row level security;
alter table public.user_book_library enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;
alter table public.review_comments enable row level security;
alter table public.activities enable row level security;
alter table public.activity_likes enable row level security;
alter table public.activity_comments enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;
