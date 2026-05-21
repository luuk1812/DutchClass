-- Run this in the Supabase SQL editor at: supabase.com → your project → SQL Editor

-- ─── Tables ────────────────────────────────────────────────────────────────

create table if not exists cards (
  id          uuid primary key default gen_random_uuid(),
  dutch       text not null,
  english     text not null,
  example_nl  text,
  example_en  text,
  category    text not null default 'vocabulary',
  created_at  timestamptz default now()
);

create table if not exists card_progress (
  id            uuid primary key default gen_random_uuid(),
  card_id       uuid not null references cards(id) on delete cascade,
  -- user_id    uuid references auth.users(id),  ← uncomment when you add auth
  interval      integer not null default 0,
  ease_factor   numeric(4,2) not null default 2.5,
  repetitions   integer not null default 0,
  due_date      date not null default current_date,
  last_reviewed timestamptz
);

create table if not exists theory_sections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  content     text not null,
  category    text not null default 'grammar',
  order_index integer not null default 0,
  created_at  timestamptz default now()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

create index if not exists idx_card_progress_due_date on card_progress(due_date);
create index if not exists idx_card_progress_card_id  on card_progress(card_id);

-- ─── Row Level Security (open for now — tighten when you add auth) ─────────

alter table cards             enable row level security;
alter table card_progress     enable row level security;
alter table theory_sections   enable row level security;

-- Allow anyone to read (personal project — no auth yet)
create policy "public read cards"           on cards           for select using (true);
create policy "public read card_progress"   on card_progress   for select using (true);
create policy "public read theory_sections" on theory_sections for select using (true);

-- Allow unauthenticated writes (personal project — tighten with auth later)
create policy "public insert card_progress" on card_progress for insert with check (true);
create policy "public update card_progress" on card_progress for update using (true);

-- ─── Sample data ───────────────────────────────────────────────────────────

insert into cards (dutch, english, example_nl, example_en, category) values
  ('de fiets',     'the bicycle',   'Ik rijd op de fiets naar school.',       'I ride my bicycle to school.',             'vocabulary'),
  ('het huis',     'the house',     'Wij wonen in een groot huis.',           'We live in a large house.',                'vocabulary'),
  ('werken',       'to work',       'Zij werkt elke dag hard.',               'She works hard every day.',                'verbs'),
  ('eten',         'to eat',        'Wij eten vanavond samen.',               'We are eating together tonight.',          'verbs'),
  ('mooi',         'beautiful',     'Wat een mooi dag!',                      'What a beautiful day!',                   'adjectives'),
  ('groot',        'big / large',   'De hond is erg groot.',                  'The dog is very big.',                    'adjectives'),
  ('goedemorgen',  'good morning',  'Goedemorgen! Hoe gaat het?',             'Good morning! How are you?',              'greetings'),
  ('tot ziens',    'goodbye',       'Tot ziens! We spreken elkaar snel.',     'Goodbye! We will talk soon.',             'greetings'),
  ('de appel',     'the apple',     'Mag ik een appel, alstublieft?',         'May I have an apple, please?',            'food'),
  ('het water',    'the water',     'Ik drink elke dag veel water.',          'I drink a lot of water every day.',       'food'),
  ('ik mis je',    'I miss you',    'Ik mis je zo erg.',                      'I miss you so much.',                     'expressions');

insert into theory_sections (title, slug, content, category, order_index) values
  (
    'De/Het — Dutch Articles',
    'de-het-articles',
    E'Dutch has two definite articles: "de" and "het".\n\n'
    '• de — used with common-gender nouns (most nouns)\n'
    '• het — used with neuter nouns (~25% of nouns)\n\n'
    'Examples:\n'
    '  de man (the man)\n'
    '  de vrouw (the woman)\n'
    '  het kind (the child)\n'
    '  het huis (the house)\n\n'
    'The indefinite article is always "een" (a/an), regardless of gender:\n'
    '  een man, een kind\n\n'
    'Tip: When you learn a new noun, always learn it with its article.',
    'grammar',
    1
  ),
  (
    'Verb Conjugation — Present Tense',
    'present-tense-conjugation',
    E'Dutch verbs follow a regular pattern in the present tense.\n\n'
    'Take the infinitive, remove "-en" to get the stem:\n'
    '  werken → werk\n\n'
    'Conjugation for "werken" (to work):\n'
    '  ik werk        (I work)\n'
    '  jij werkt      (you work)\n'
    '  hij/zij werkt  (he/she works)\n'
    '  wij werken     (we work)\n'
    '  jullie werken  (you all work)\n'
    '  zij werken     (they work)\n\n'
    'Note: "jij" loses the -t when it comes AFTER the verb:\n'
    '  Werk jij hier? (Do you work here?)',
    'grammar',
    2
  ),
  (
    'Word Order — V2 Rule',
    'word-order-v2',
    E'Dutch uses the V2 (verb-second) rule: the finite verb is always the second element.\n\n'
    'Normal order:\n'
    '  Ik eet een appel.  (I eat an apple.)\n\n'
    'When you front another element, the verb still stays second:\n'
    '  Morgen eet ik een appel.  (Tomorrow I eat an apple.)\n'
    '  Een appel eet ik morgen.  (An apple I eat tomorrow.)\n\n'
    'In subordinate clauses the verb moves to the END:\n'
    '  ...omdat ik een appel eet.  (...because I eat an apple.)',
    'grammar',
    3
  );
