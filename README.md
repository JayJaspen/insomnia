# 🌙 Insomnia.nu

> *Kan du inte sova? Du är inte ensam. Välkommen in i värmen.*

En svensk nattklubb på nätet — en chattjänst öppen **22:00–06:00** för nattugglor som vill ha sällskap.

---

## Innehåll

- [Teknikstack](#teknikstack)
- [Projektstruktur](#projektstruktur)
- [Komma igång](#komma-igång)
- [Miljövariabler](#miljövariabler)
- [Databas — Supabase](#databas--supabase)
- [Driftsättning på Vercel](#driftsättning-på-vercel)
- [Funktioner](#funktioner)
- [Öppettider och åtkomstkontroll](#öppettider-och-åtkomstkontroll)
- [Admin-panel](#admin-panel)
- [Automatisk rensning](#automatisk-rensning)
- [Avatarer](#avatarer)
- [PWA — App-installation](#pwa--app-installation)
- [Ordfilter](#ordfilter)

---

## Teknikstack

| Del | Teknologi |
|-----|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Databas & Auth | [Supabase](https://supabase.com) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Ikonbibliotek | [Lucide React](https://lucide.dev) |
| Driftsättning | [Vercel](https://vercel.com) |
| Domän | one.com → www.insomnia.nu |

---

## Projektstruktur

```
src/
├── app/
│   ├── page.tsx                  # Startsida med nedräkning
│   ├── mood/page.tsx             # Humörval efter inloggning
│   ├── offline/page.tsx          # PWA offline-sida
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx        # Inloggning
│   │   └── register/page.tsx     # Registrering (3 steg)
│   │
│   ├── (app)/                    # Skyddade användar-routes
│   │   ├── layout.tsx            # Kollar auth + admin-redirect
│   │   ├── chat/page.tsx         # Chatt-vy
│   │   └── profile/page.tsx      # Min sida
│   │
│   ├── admin/                    # Admin-panel (separat layout)
│   │   ├── layout.tsx            # Kollar admin-roll
│   │   ├── page.tsx              # Redirect → /admin/history
│   │   ├── history/page.tsx      # Arkiv & historik
│   │   ├── users/page.tsx        # Användarhantering
│   │   └── reports/page.tsx      # Anmälningar
│   │
│   └── api/
│       ├── auth/register/        # Registrerings-API
│       ├── chat/check-message/   # Ordfilter-kontroll
│       └── cron/
│           ├── cleanup-chats/    # Rensar chattar kl. 06:30
│           └── create-archive/   # Skapar ZIP-arkiv kl. 06:00
│
├── components/
│   ├── AppNav.tsx                # Navigationsfält (användare)
│   ├── AdminNav.tsx              # Navigationsfält (admin)
│   ├── ChatView.tsx              # Chatt-komponent med realtid
│   ├── ProfileView.tsx           # Profilredigering + vänner
│   ├── InstallBanner.tsx         # PWA install-banner (mobil)
│   ├── ReportButton.tsx          # Anmäl-knapp i chatten
│   └── admin/
│       ├── HistoryView.tsx       # Arkiv-vy
│       ├── UsersView.tsx         # Användar-vy med filter
│       └── ReportsView.tsx       # Anmälnings-vy
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase
│   │   └── server.ts             # Server-side Supabase + admin
│   ├── constants.ts              # Län, städer, humör, avatarer
│   └── utils.ts                  # isServiceOpen(), calcAge() m.m.
│
└── middleware.ts                  # Route-skydd + redirect-logik
```

---

## Komma igång

### 1. Klona och installera

```bash
git clone https://github.com/ditt-repo/insomnia.git
cd insomnia
npm install
```

### 2. Sätt upp miljövariabler

Se avsnittet [Miljövariabler](#miljövariabler) nedan och skapa `.env.local`.

### 3. Kör databasen

Kör SQL-migrationer i Supabase SQL Editor (se [Databas](#databas--supabase)).

### 4. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

> **Tips under utveckling:** Tjänsten är tidsbegränsad till 22:00–06:00. Du kan tillfälligt ändra `isServiceOpen()` i `src/lib/utils.ts` till att alltid returnera `true`.

---

## Miljövariabler

Skapa `.env.local` i projektets rot:

```env
# Supabase — hämtas från Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Cron-hemlighet — välj ett starkt lösenord
CRON_SECRET=ditt-hemliga-cron-losenord
```

---

## Databas — Supabase

Kör följande SQL i **Supabase → SQL Editor** innan du startar projektet.

### Användarprofiler

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  display_name TEXT UNIQUE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('man','kvinna','annat')),
  county TEXT NOT NULL,
  city TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  avatar_id TEXT NOT NULL DEFAULT 'male_01',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','moderator','admin')),
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now()
);
```

### Rum, meddelanden och anmälningar

```sql
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','read','saved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.mood_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.daily_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.banned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
);
```

### Sätt admin-roll

Efter att du registrerat ditt konto, kör detta i SQL Editor:

```sql
UPDATE public.users
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'din@email.se'
);
```

---

## Driftsättning på Vercel

1. Pusha koden till GitHub
2. Koppla repot i [vercel.com](https://vercel.com)
3. Sätt **Framework Preset → `Next.js`** (viktigt — inte "Other")
4. Lägg till alla miljövariabler under *Settings → Environment Variables*
5. Lägg till domänen under *Settings → Domains*: `insomnia.nu` och `www.insomnia.nu`

### DNS-inställningar på one.com

| Typ | Namn | Värde |
|-----|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

### Cron-jobb

Lägg till i `vercel.json` (UTC-tider, anpassa för sommartid):

```json
{
  "crons": [
    { "path": "/api/cron/create-archive", "schedule": "0 4 * * *" },
    { "path": "/api/cron/cleanup-chats",  "schedule": "30 4 * * *" }
  ]
}
```

Vercel Cron kör i UTC. Stockholmstid 06:00 = UTC 04:00 (vintertid) / UTC 03:00 (sommartid).

---

## Funktioner

### Registrering (3 steg)

1. Personuppgifter: Riktigt namn (privat), visningsnamn, kön, födelseår, e-post, lösenord
2. Plats: Välj bland Sveriges 21 län, sedan stad baserat på valt län
3. Avatar: Välj bland 60 unika SVG-avatarer (man, kvinna, djur)

### Användar-vy

**Humörval** — Visas direkt efter inloggning. Välj bland 10 humör (Sömnig, Glad, Melankolisk, Tankfull, Rastlös, Ängslig, Lyssnar, Kärleksfull, Rolig, Stressad). Humöret syns bredvid användarnamnet i chatten.

**Flik 1 — Chat**
- Se alla inloggade användare med kön, ålder och stad
- Realtidschat via Supabase Realtime
- Skicka bilder från kamera (mobil)
- Skapa gruppchattar med valfritt namn (öppna för alla)
- Skapa privatchattar (bara inbjudna kan se och delta)
- Skicka vänförfrågan — mottagaren godkänner eller nekar
- Anmäl en användare via ⚑-knappen på ett meddelande

**Flik 2 — Min sida**
- Redigera visningsnamn, avatar, län, stad och lösenord
- Se vänlista och avsluta vänskaper

---

## Öppettider och åtkomstkontroll

| Tid (Stockholmstid) | Status |
|---------------------|--------|
| 22:00 – 06:00 | ✅ Öppet — inloggning tillåten |
| 06:00 – 22:00 | ❌ Stängt — nedräkning visas på startsidan |

Startsidan visar alltid en live-nedräkning till nästa öppning.

Försöker en vanlig användare logga in utanför öppettiderna visas: *"Insomnia är stängt just nu. Välkommen tillbaka kl. 22:00! 🌙"*

**Admin är undantagen och kan alltid logga in**, oavsett tid på dygnet.

Spärrade användare (`is_blocked = true`) blockeras vid inloggning oavsett tid.

---

## Admin-panel

Nås på `/admin`. Kräver `role = 'admin'` i databasen. Admin har en helt separat layout utan de vanliga användar-flikarna.

### Flik 1 — Historik (`/admin/history`)

- Dropdown med alla datum som har sparade ZIP-arkiv
- Visar filstorlek och lagringssökväg
- Ladda ner ZIP direkt från Supabase Storage
- Radera ett datums arkiv permanent

### Flik 2 — Användare (`/admin/users`)

- Tabellvy över alla registrerade användare
- Filter: kön, ålder (min/max), län
- Spärra eller häv spärr med ett klick
- Spärrade användare kan inte logga in

### Flik 3 — Anmälningar (`/admin/reports`)

- Alla inkomna anmälningar med: vem anmäler, vem anmäls, anledning och datum
- Statusfilter: Nya / Alla / Sparade
- Åtgärder: Markera läst, Spara, Spärra den anmälda, Radera
- Nya anmälningar är markerade med gul badge

---

## Automatisk rensning

Varje natt körs två cron-jobb automatiskt via Vercel:

| Tidpunkt (SVT) | Åtgärd |
|----------------|--------|
| **06:00** | Skapar ZIP-arkiv med alla chattar och bilder → lagras i Supabase Storage |
| **06:30** | Raderar alla meddelanden, bilder och chattdata från databasen |

Arkivet innehåller ett `manifest.json` som visar vilka meddelanden och bilder som tillhör vilken användare. Admin kan ladda ned och öppna arkivet för granskning.

Det enda som **inte** raderas är: registrerade användare, deras profiluppgifter och vänskapsband.

---

## Avatarer

60 unika handkodade SVG-avatarer med detaljerade cartoon-ansikten:

| Fil | Antal | Innehåll |
|-----|-------|----------|
| `male_01` – `male_20` | 20 | Manliga ansikten, 5 hudtoner, varierande frisyrer, glasögon, skägg, stubbar |
| `female_01` – `female_20` | 20 | Kvinnliga ansikten, 5 hudtoner, örhängen, blommor, ögonfransar, rosiga kinder |
| `animal_01` – `animal_20` | 20 | Katt, hund, räv, kanin, björn, panda, uggla, pingvin, hjort, enhörning, varg m.fl. |

Regenerera alla avatarer:

```bash
node generate_avatars.mjs
```

---

## PWA — App-installation

Insomnia.nu är en Progressive Web App och kan installeras som en native app på mobilen.

**Android / Chrome** — En install-banner visas automatiskt 2 sekunder efter besök. Tryck "Installera" för att lägga till på hemskärmen.

**iOS / Safari** — Bannern visar instruktionen: *Tryck dela-ikonen → Lägg till på hemskärmen.*

PWA-ikoner finns i `public/icons/icon-192.png` och `public/icons/icon-512.png`.

---

## Ordfilter

Alla meddelanden kontrolleras mot tabellen `banned_words` innan de skickas. Könsord är **inte** spärrade som standard.

Lägg till spärrade ord via Supabase SQL Editor:

```sql
INSERT INTO public.banned_words (word, category) VALUES
('hata dig', 'hat'),
('döda dig', 'hot'),
('skada dig', 'sjalvskada'),
('hoppa', 'sjalvskada');
```

Kategorierna används bara för admin-statistik och loggar. Användaren ser meddelandet: *"Meddelandet innehåller otillåtet innehåll."*

---

*© insomnia.nu — Privat projekt*
