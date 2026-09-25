# ⚽ Aalto Football

Aalto Football is a web app for pick-up football in **Bergen, Norway**.
**Hosts** create matches (pitch, time, format, level and spots) and **players** find them and join.
Think Playtomic, but for 5-, 7-, 9- and 11-a-side football.

The site is in **English** by default, with **Norwegian (bokmål)** available through the language switcher.
It can be installed on a phone's home screen as a **PWA**.

> Status: in development. Players can sign up, find matches, join or leave (with a waitlist), and hosts can
> create, edit, cancel and share matches. Online payments are disabled for now (see [Roadmap](#-roadmap)).

## ✨ Features

- **Accounts:** email + password, email sign-in link, optional Google sign-in, profile onboarding (level, position, language)
- **Find matches:** filters by day, area, level, format and free spots
- **Match page:** players and waitlist, pitch details with map and directions, join/leave, share (link, WhatsApp, native share), add to calendar (.ics)
- **Hosting:** create, edit and cancel matches; private matches are link-only
- **My matches:** upcoming, hosting and past
- **English and Norwegian (bokmål)**, installable **PWA** with offline page

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

Requirements: Node.js 20+ and, for a local database, Docker.

```bash
git clone https://github.com/agustinsoares/futbol-7.git
cd futbol-7

# Local Supabase (Postgres + Auth + API) with the migrations and Bergen seed data
npx supabase start          # prints the local API URL and publishable key

cd apps/web
cp ../../.env.example .env.local   # paste the local URL and publishable key
npm install
npm run dev                        # http://localhost:3000
```

Seed users get a random password. To log in locally, set one:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "update auth.users set encrypted_password = extensions.crypt('local-pass-123', extensions.gen_salt('bf')) where email like '%@aaltofootball.test'"
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

Project: `yqtxllyhmmwgvvirlput` (organisation *Aalto Football*). Migrations and sample data are already applied.

To set up a new project:

1. Apply the migrations in `supabase/migrations/` in order (SQL editor or `supabase db push`).
2. Optionally run `supabase/seed.sql` for Bergen sample data. It creates `admin@aaltofootball.test` (admin),
   `player@aaltofootball.test` (regular user) and 20 more players, 7 pitches and 12 matches.
   Users get a random password: set one from **Authentication → Users** to log in with them.
3. Put the project URL and publishable key in `apps/web/.env.production` (public values) and in `.env.local` for development.

Security model:

- Everyone can read public matches, pitches and profiles. Private matches are only visible to the host, players in them and admins.
- Only admins manage pitches and change roles.
- Joining and leaving happen only through `join_match` / `leave_match`, which lock the match row so the last spot can't be taken twice, and move the first waitlisted player up when someone drops out.

### Auth settings (Supabase dashboard → Authentication → URL Configuration)

- **Site URL:** the production URL of the site.
- **Redirect URLs:** add `https://<your-domain>/**` and `https://*-<your-vercel-team>.vercel.app/**` (for previews).
- **Google sign-in (optional):** enable the Google provider in Supabase and set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`.
- **Emails:** Supabase's built-in email service is heavily rate-limited; configure custom SMTP before launch
  so confirmation and sign-in links reach everyone.

## 🚀 Deploy on Vercel

- **Root Directory:** `apps/web`
- **Environment variables:** none required; the public Supabase values are in `apps/web/.env.production`.
  Set `NEXT_PUBLIC_SITE_URL` only if you use a custom domain.

## 🗺️ Roadmap

- [x] Landing page (English + Norwegian bokmål)
- [x] Installable PWA with offline page
- [x] Database schema, security rules and Bergen sample data
- [x] Sign in (password, email link, optional Google) and profile onboarding
- [x] Create, edit and cancel matches (hosts)
- [x] Match search with filters
- [x] Match page: join and leave, with waitlist
- [x] Share links, link-only private matches and calendar export
- [ ] Email reminders before kick-off
- [ ] Map view of matches
- [ ] Balanced teams, results, ratings and player level
- [ ] Online payments (disabled for now)

## 🎨 Brand

Colours, typography and tone: [`docs/football_league_branding.md`](docs/football_league_branding.md).

## 📄 License

MIT.

## 👤 Author

**Agustín M. Soares**: [LinkedIn](https://www.linkedin.com/in/agustinsoares) · [Portfolio](https://agustinsoares.github.io/) · [GitHub](https://github.com/agustinsoares)
