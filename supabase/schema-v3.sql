-- Run in Supabase SQL Editor — adds Anki-style states, stats, and per-user settings

-- ─── card_progress: new columns ──────────────────────────────────────────────

alter table card_progress
  add column if not exists state       text not null default 'new'
    check (state in ('new','learning','review','relearning')),
  add column if not exists step_index  integer not null default 0,
  add column if not exists due_at      timestamptz,   -- minute-precision for learning cards
  add column if not exists lapses      integer not null default 0;

-- Migrate any existing reviewed cards to 'review' state
update card_progress set state = 'review' where interval > 0;

-- ─── reviews: one row per rating event ───────────────────────────────────────

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     uuid not null references cards(id) on delete cascade,
  rating      integer not null check (rating between 1 and 4),
  state_before text not null default 'new',
  created_at  timestamptz default now()
);

create index if not exists idx_reviews_user_created on reviews(user_id, created_at);

alter table reviews enable row level security;
create policy "user manage own reviews" on reviews
  for all using (auth.uid() = user_id);

-- ─── user_settings ───────────────────────────────────────────────────────────

create table if not exists user_settings (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  learning_steps       text    not null default '1 10',   -- space-sep minutes
  graduating_interval  integer not null default 1,         -- days
  easy_interval        integer not null default 4,         -- days
  relearn_steps        text    not null default '10',      -- space-sep minutes
  new_cards_per_day    integer not null default 20,
  max_reviews_per_day  integer not null default 200
);

alter table user_settings enable row level security;
create policy "user manage own settings" on user_settings
  for all using (auth.uid() = user_id);
