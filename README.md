# ⚽ Aalto Football

Aalto Football is a web app for pick-up football in **Bergen, Norway**.
**Hosts** create matches (pitch, time, format, level and spots) and **players** find them and join.
Think Playtomic, but for 5-, 7-, 9- and 11-a-side football.

The site is in **English** by default, with **Norwegian (bokmål)** available through the language switcher.
It can be installed on a phone's home screen as a **PWA**.

> Status: in development. The public landing page, the database schema and the sample data are ready.
> Accounts, match creation and search are next (see [Roadmap](#-roadmap)). Online payments are disabled for now.

---

## 🛠️ Stack

- **Web:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, in `apps/web`
- **Backend:** Supabase (Postgres + Auth + RLS), with migrations in `supabase/`
- **Deploy:** Vercel
- **CI:** GitHub Actions (lint, types, format, build, and migrations against a real Postgres)

## 📂 Structure

```
.
├─ apps/web/                  # Next.js app (deployed to Vercel)
│  ├─ public/                 # Hero image, PWA icons, service worker (sw.js)
│  └─ src/
│     ├─ app/[lang]/          # Localised routes: /en/… and /nb/…
│     ├─ app/manifest.ts      # PWA manifest
│     ├─ components/          # Header, Footer, MatchCard, LanguageSwitcher…
│     ├─ i18n/                # Language config and dictionaries (en, nb)
│     ├─ lib/supabase/        # Supabase clients and database types
│     └─ proxy.ts             # Redirects / to /en or /nb (cookie, then browser language)
├─ supabase/
│  ├─ migrations/             # Schema, RLS policies, join/leave functions
│  ├─ seed.sql                # Bergen sample data (users, pitches, matches)
│  └─ tests/                  # Local Supabase stub + RLS tests
└─ docs/                      # Brand guide
```

## ⚙️ Local development

Requirements: Node.js 20+.

```bash
git clone https://github.com/agustinsoares/futbol-7.git
cd futbol-7/apps/web
cp ../../.env.example .env.local   # fill in the Supabase values
npm install
npm run dev                        # http://localhost:3000
```

Without Supabase variables the site still runs and shows sample matches.

Useful commands (from `apps/web`):

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run format        # Prettier
npm run build         # production build
```

## 🗄️ Database (Supabase)

1. Apply the migrations in `supabase/migrations/` in order (SQL editor or `supabase db push`).
2. Optionally run `supabase/seed.sql` for Bergen sample data. It creates `admin@aaltofootball.test` (admin),
   `player@aaltofootball.test` (regular user) and 20 more players, 7 pitches and 12 matches.
   Users get a random password: set one from **Authentication → Users** to log in with them.
3. Copy the project URL and publishable key into `.env.local` and into Vercel's environment variables.

Security model:

- Everyone can read public matches, pitches and profiles. Private matches are only visible to the host, players in them and admins.
- Only admins manage pitches and change roles.
- Joining and leaving happen only through `join_match` / `leave_match`, which lock the match row so the last spot can't be taken twice, and move the first waitlisted player up when someone drops out.

## 🚀 Deploy on Vercel

- **Root Directory:** `apps/web`
- **Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (and `NEXT_PUBLIC_SITE_URL` if you use a custom domain)

## 🗺️ Roadmap

- [x] Landing page (English + Norwegian bokmål)
- [x] Installable PWA with offline page
- [x] Database schema, security rules and Bergen sample data
- [ ] Sign in (Google and email magic link) and profile onboarding
- [ ] Create, edit and cancel matches (hosts)
- [ ] Match search with filters and map
- [ ] Match page: join and leave, with waitlist
- [ ] Share links and private matches by invite
- [ ] Reminders and calendar export
- [ ] Balanced teams, results, ratings and player level
- [ ] Online payments (disabled for now)

## 🎨 Brand

Colours, typography and tone: [`docs/football_league_branding.md`](docs/football_league_branding.md).

## 📄 License

MIT.

## 👤 Author

**Agustín M. Soares**: [LinkedIn](https://www.linkedin.com/in/agustinsoares) · [Portfolio](https://agustinsoares.github.io/) · [GitHub](https://github.com/agustinsoares)
