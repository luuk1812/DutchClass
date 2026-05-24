-- ─── Run in Supabase SQL Editor ─────────────────────────────────────────────

-- 1. Add deck column to cards
alter table cards add column if not exists deck text not null default 'dutch';

-- 2. Make sure existing cards are in the 'dutch' deck
update cards set deck = 'dutch' where deck = 'dutch';

-- 3. Insert 20 common Dutch sentences (common sentences deck)
insert into cards (dutch, english, example_nl, example_en, category, deck) values
  ('Hoe gaat het met je?',          'How are you?',                     'Hoe gaat het met je? Alles goed?',               'How are you? Is everything okay?',                  'phrases', 'common sentences'),
  ('Wat is jouw naam?',             'What is your name?',               'Hallo, wat is jouw naam?',                       'Hello, what is your name?',                         'phrases', 'common sentences'),
  ('Aangenaam kennis te maken.',    'Nice to meet you.',                'Dit is mijn collega. Aangenaam kennis te maken.', 'This is my colleague. Nice to meet you.',            'phrases', 'common sentences'),
  ('Ik begrijp het niet.',          'I don''t understand.',             'Sorry, ik begrijp het niet. Kunt u dat herhalen?','Sorry, I don''t understand. Can you repeat that?',  'phrases', 'common sentences'),
  ('Kunt u dat herhalen?',          'Can you repeat that?',             'Kunt u dat herhalen? Ik hoorde het niet.',         'Can you repeat that? I didn''t hear it.',           'phrases', 'common sentences'),
  ('Spreekt u Engels?',             'Do you speak English?',            'Spreekt u Engels? Mijn Nederlands is niet zo goed.','Do you speak English? My Dutch isn''t that good.',  'phrases', 'common sentences'),
  ('Waar is het toilet?',           'Where is the bathroom?',           'Excuseer, waar is het toilet?',                   'Excuse me, where is the bathroom?',                 'phrases', 'common sentences'),
  ('Hoeveel kost dit?',             'How much does this cost?',         'Hoeveel kost dit jasje?',                         'How much does this jacket cost?',                   'phrases', 'common sentences'),
  ('Ik heb honger.',                'I am hungry.',                     'Het is al drie uur. Ik heb honger!',               'It''s already three o''clock. I am hungry!',        'phrases', 'common sentences'),
  ('Ik ben moe.',                   'I am tired.',                      'Na het werk ben ik altijd moe.',                   'After work I am always tired.',                     'phrases', 'common sentences'),
  ('Het spijt me.',                 'I am sorry.',                      'Het spijt me, dat was mijn fout.',                 'I am sorry, that was my mistake.',                  'phrases', 'common sentences'),
  ('Excuseer me.',                  'Excuse me.',                       'Excuseer me, mag ik er even langs?',               'Excuse me, may I get past?',                        'phrases', 'common sentences'),
  ('Kunt u mij helpen?',            'Can you help me?',                 'Kunt u mij helpen? Ik zoek het station.',          'Can you help me? I am looking for the station.',    'phrases', 'common sentences'),
  ('Ik hou van jou.',               'I love you.',                      'Ik hou van jou, voor altijd.',                     'I love you, forever.',                              'phrases', 'common sentences'),
  ('Wat doe je voor werk?',         'What do you do for work?',         'Wat doe je voor werk? Ik ben leraar.',             'What do you do for work? I am a teacher.',          'phrases', 'common sentences'),
  ('Waar kom jij vandaan?',         'Where are you from?',              'Waar kom jij vandaan? Ik kom uit Engeland.',       'Where are you from? I am from England.',            'phrases', 'common sentences'),
  ('Ik woon in Nederland.',         'I live in the Netherlands.',       'Ik woon al drie jaar in Nederland.',               'I have lived in the Netherlands for three years.',  'phrases', 'common sentences'),
  ('Kun je dat opschrijven?',       'Can you write that down?',         'Kun je dat opschrijven? Ik vergeet het anders.',   'Can you write that down? Otherwise I will forget.', 'phrases', 'common sentences'),
  ('Wat betekent dit woord?',       'What does this word mean?',        'Wat betekent dit woord? Ik ken het niet.',         'What does this word mean? I don''t know it.',       'phrases', 'common sentences'),
  ('Proost!',                       'Cheers!',                          'Op je verjaardag! Proost!',                        'To your birthday! Cheers!',                         'phrases', 'common sentences');
