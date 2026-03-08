-- INSOMNIA.NU – Initial banned words list (expand via admin panel)
INSERT INTO public.banned_words (word, category) VALUES
  ('jag ska döda', 'hot'), ('jag ska skada dig', 'hot'),
  ('jag vet var du bor', 'hot'), ('jag ska hitta dig', 'hot'),
  ('ta livet av mig', 'sjalvskada'), ('vill inte leva', 'sjalvskada'),
  ('begå självmord', 'sjalvskada'), ('skada mig själv', 'sjalvskada'),
  ('alla invandrare', 'hatbrott'),
  ('skicka bild på dig naken', 'grooming'),
  ('personnummer', 'ovrigt'), ('bankkontonummer', 'ovrigt')
ON CONFLICT (word) DO NOTHING;
