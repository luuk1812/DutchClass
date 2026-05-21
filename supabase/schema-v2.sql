-- ─── Run this in Supabase SQL Editor (Settings → SQL Editor) ────────────────
-- This updates the existing schema to support auth, roles, and per-user progress.

-- ─── 1. Profiles table (one row per user, auto-created on signup) ────────────

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create a profile whenever someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── 2. Add user_id to card_progress ────────────────────────────────────────

alter table card_progress
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Unique progress per user per card
alter table card_progress
  drop constraint if exists card_progress_user_card_unique;

alter table card_progress
  add constraint card_progress_user_card_unique unique (user_id, card_id);

-- ─── 3. Drop old open policies ───────────────────────────────────────────────

drop policy if exists "public read cards"           on cards;
drop policy if exists "public read card_progress"   on card_progress;
drop policy if exists "public read theory_sections" on theory_sections;
drop policy if exists "public insert card_progress" on card_progress;
drop policy if exists "public update card_progress" on card_progress;

-- ─── 4. Cards — authenticated read, admin write ──────────────────────────────

create policy "auth read cards" on cards
  for select using (auth.role() = 'authenticated');

create policy "admin insert cards" on cards
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin update cards" on cards
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin delete cards" on cards
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 5. Card progress — per user ─────────────────────────────────────────────

create policy "user read own progress" on card_progress
  for select using (auth.uid() = user_id);

create policy "user insert own progress" on card_progress
  for insert with check (auth.uid() = user_id);

create policy "user update own progress" on card_progress
  for update using (auth.uid() = user_id);

-- ─── 6. Theory sections — authenticated read, admin write ───────────────────

drop policy if exists "public read theory_sections" on theory_sections;

create policy "auth read theory_sections" on theory_sections
  for select using (auth.role() = 'authenticated');

create policy "admin insert theory_sections" on theory_sections
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin update theory_sections" on theory_sections
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin delete theory_sections" on theory_sections
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 7. Profiles — users read own, admins read all ───────────────────────────

alter table profiles enable row level security;

create policy "user read own profile" on profiles
  for select using (auth.uid() = id);

create policy "user update own profile" on profiles
  for update using (auth.uid() = id);

-- Allow reading any profile so admin checks work (needed by RLS functions above)
create policy "auth read all profiles" on profiles
  for select using (auth.role() = 'authenticated');

-- ─── 8. Make yourself admin ──────────────────────────────────────────────────
-- After signing up, run this (replace with your email):
--
--   update profiles set role = 'admin' where email = 'your@email.com';
--
