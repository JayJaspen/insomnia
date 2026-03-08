-- INSOMNIA.NU – Initial Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT UNIQUE NOT NULL CHECK (char_length(display_name) BETWEEN 3 AND 20),
  full_name    TEXT NOT NULL,
  gender       TEXT NOT NULL CHECK (gender IN ('man','kvinna','annat')),
  county       TEXT NOT NULL,
  city         TEXT NOT NULL,
  birth_year   INTEGER NOT NULL CHECK (birth_year BETWEEN 1930 AND 2007),
  avatar_id    TEXT NOT NULL DEFAULT 'male_01',
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  is_blocked   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.friendships (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT,
  type       TEXT NOT NULL CHECK (type IN ('group','private')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_room_members (
  room_id   UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id   UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content    TEXT,
  has_image  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.message_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id   UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 1000),
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','saved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banned_words (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word     TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('hot','sjalvskada','hatbrott','grooming','ovrigt')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_archives (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date         DATE NOT NULL UNIQUE,
  storage_path TEXT NOT NULL,
  file_size    BIGINT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mood_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood         TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_req  ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addr ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.chat_room_members(user_id);

-- Auto-update friendship timestamp
CREATE OR REPLACE FUNCTION public.update_friendship_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
CREATE TRIGGER friendship_updated
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_friendship_timestamp();
