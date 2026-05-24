-- ─── Run in Supabase SQL Editor ─────────────────────────────────────────────
-- Adds the "food & drinks" deck with 20 common Dutch foods and beverages

insert into cards (dutch, english, example_nl, example_en, category, deck) values
  ('de koffie',      'coffee',       'Ik drink elke ochtend een kop koffie.',          'I drink a cup of coffee every morning.',           'food', 'food & drinks'),
  ('het bier',       'beer',         'Hij bestelde een koud biertje in het café.',      'He ordered a cold beer at the café.',              'food', 'food & drinks'),
  ('het brood',      'bread',        'We eten brood met kaas voor het ontbijt.',        'We eat bread with cheese for breakfast.',          'food', 'food & drinks'),
  ('de kaas',        'cheese',       'Nederland is beroemd om zijn kaas.',              'The Netherlands is famous for its cheese.',        'food', 'food & drinks'),
  ('de melk',        'milk',         'Kinderen drinken veel melk.',                     'Children drink a lot of milk.',                    'food', 'food & drinks'),
  ('de thee',        'tea',          'Wil je een kopje thee?',                          'Would you like a cup of tea?',                     'food', 'food & drinks'),
  ('de soep',        'soup',         'Op koude dagen eet ik graag soep.',               'On cold days I like to eat soup.',                 'food', 'food & drinks'),
  ('het vlees',      'meat',         'Hij eet geen vlees, hij is vegetariër.',          'He does not eat meat, he is a vegetarian.',        'food', 'food & drinks'),
  ('de vis',         'fish',         'Op vrijdag eten wij altijd vis.',                 'On Fridays we always eat fish.',                   'food', 'food & drinks'),
  ('de aardappel',   'potato',       'Stamppot wordt gemaakt met aardappelen.',         'Stamppot is made with potatoes.',                  'food', 'food & drinks'),
  ('het ei',         'egg',          'Ik wil graag twee eieren met spek.',              'I would like two eggs with bacon.',                'food', 'food & drinks'),
  ('de groente',     'vegetables',   'Probeer elke dag groente te eten.',               'Try to eat vegetables every day.',                 'food', 'food & drinks'),
  ('de rijst',       'rice',         'We eten vanavond rijst met kip.',                 'We are eating rice with chicken tonight.',         'food', 'food & drinks'),
  ('de pasta',       'pasta',        'Pasta met tomatensaus is mijn lievelingseten.',   'Pasta with tomato sauce is my favourite food.',    'food', 'food & drinks'),
  ('de wijn',        'wine',         'Mag ik een glas rode wijn?',                      'May I have a glass of red wine?',                  'food', 'food & drinks'),
  ('het sap',        'juice',        'Hij drinkt elke ochtend sinaasappelsap.',         'He drinks orange juice every morning.',            'food', 'food & drinks'),
  ('de friet',       'fries',        'In Nederland eet je friet met mayonaise.',        'In the Netherlands you eat fries with mayonnaise.','food', 'food & drinks'),
  ('de boter',       'butter',       'Doe je boter op je brood?',                       'Do you put butter on your bread?',                 'food', 'food & drinks'),
  ('het ontbijt',    'breakfast',    'Het ontbijt is de belangrijkste maaltijd.',       'Breakfast is the most important meal.',            'food', 'food & drinks'),
  ('de stroopwafel', 'stroopwafel',  'Een stroopwafel op je koffie is heerlijk.',       'A stroopwafel on your coffee is delicious.',       'food', 'food & drinks');
