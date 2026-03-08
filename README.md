# Insomnia.nu

> "Kan du inte sova? Du är inte ensam. Välkommen in i värmen."

Mörk, anonym chattplattform. Öppen **22:00–06:00**.

## Kom igång

### 1. Installera
```bash
npm install
```

### 2. Supabase
- Skapa projekt på https://app.supabase.com
- Kör SQL-migreringarna i ordning: `supabase/migrations/001_` → `004_`
- Kopiera `.env.local.example` → `.env.local` och fyll i nycklar

### 3. Kör lokalt
```bash
npm run dev
```

### 4. Deploy
- Koppla GitHub-repo till Vercel
- Lägg till miljövariabler
- Lägg till domän www.insomnia.nu

### DNS (one.com → Vercel)
| Typ | Namn | Värde |
|-----|------|-------|
| CNAME | www | cname.vercel-dns.com |
| A | @ | 76.76.21.21 |

### Skapa admin
Sätt `role = 'admin'` i `users`-tabellen via Supabase Dashboard.
