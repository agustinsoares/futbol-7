
# LigaF7 – Amateur Football League Management Platform

<p align="center">
  <!-- Tech stack badges -->
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white"></a>
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://tailwindcss.com/"><img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white"></a>
  <a href="https://ui.shadcn.com/"><img alt="shadcn/ui" src="https://img.shields.io/badge/shadcn%2Fui-111827"></a>
  <a href="https://nestjs.com/"><img alt="NestJS" src="https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white"></a>
  <a href="https://www.postgresql.org/"><img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white"></a>
  <a href="https://www.prisma.io/"><img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?logo=Prisma&logoColor=white"></a>
  <a href="https://stripe.com/"><img alt="Stripe" src="https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white"></a>
  <a href="https://www.docker.com/"><img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white"></a>
  <a href="https://github.com/features/actions"><img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white"></a>
  <a href="https://vercel.com/"><img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white"></a>
  <a href="https://railway.app/"><img alt="Railway" src="https://img.shields.io/badge/Railway-0B0D0E?logo=railway&logoColor=white"></a>
</p>

<p align="center">
  <!-- Project meta badges -->
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
  <img alt="Status" src="https://img.shields.io/badge/status-WIP-yellow">
  <!-- Optional build status placeholder; replace 'yourusername' once CI is set up -->
  <!--<a href="https://github.com/agustinsoares/ligaf7/actions">
    <img alt="CI" src="https://github.com/agustinsoares/ligaf7/workflows/CI/badge.svg">
  </a>-->
</p>

## 📌 Overview
LigaF7 is a full‑stack web application for managing amateur 7‑a‑side football leagues.  
It allows organizers to create tournaments, register teams, schedule matches, track results, generate standings, and manage payments.

This project is **fictional but fully functional** – designed to showcase modern full‑stack skills for a portfolio.

---

## 🚀 Features
- Public landing page with league info, rules, and sponsors
- User authentication (players, captains, referees, admins)
- Team registration & player invitations
- Season/league management (fixtures, venues, referees)
- Match scheduling with results & statistics (goals, cards, assists)
- Standings, top scorers & fair play tables
- Online payments (Stripe test mode)
- Admin panel for CRUD operations
- Responsive UI (mobile‑first, also optimized for desktop)
- Deployment ready with Docker + CI/CD (GitHub Actions)

---

## 🛠️ Tech Stack
### Frontend
- Next.js 14 (React + App Router)
- TypeScript
- TailwindCSS
- shadcn/ui (UI components)
- Zustand / Redux Toolkit (state management, optional)

### Backend
- NestJS (TypeScript backend framework)
- PostgreSQL (database)
- Prisma (ORM)
- NextAuth.js (authentication)
- Stripe (payments – test mode)

### Infrastructure / DevOps
- Docker
- GitHub Actions (CI/CD)
- Deployment: Vercel (frontend) + Railway/Fly.io (API + DB)

---

## 📂 Repository Structure
```
.
├─ apps/
│  ├─ web/              # Next.js frontend
│  └─ api/              # NestJS backend
├─ packages/
│  ├─ ui/               # shared UI components
│  └─ config/           # eslint, tsconfig, tailwind config
├─ prisma/
│  ├─ schema.prisma     # database schema
│  └─ seed.ts           # seed data
├─ docker-compose.yml
├─ .github/workflows/ci.yml
└─ README.md
```

---

## ⚙️ Setup & Development
### 1. Clone repository
```bash
git clone https://github.com/yourusername/ligaf7.git
cd ligaf7
```

### 2. Environment variables
Create a `.env` file in the root folder:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ligaf7"
NEXTAUTH_SECRET="changeme"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

### 3. Run with Docker
```bash
docker compose up -d
```

### 4. Migrate & seed database
```bash
pnpm prisma migrate dev
pnpm ts-node prisma/seed.ts
```

### 5. Start development
Frontend:
```bash
cd apps/web
pnpm dev
```
Backend:
```bash
cd apps/api
pnpm start:dev
```

---

## 🧪 Tests
- Unit tests: Jest
- End‑to‑end tests: Playwright
- Run all tests:
```bash
pnpm test
```

---

## 📸 Screenshots / Demo
_(to be added once UI is built – mobile and desktop views)_

---

## 📄 License
MIT License – free to use and adapt.

---

## 👤 Author
**Agustín M. Soares**  
- LinkedIn: https://www.linkedin.com/in/agustinsoares
- Portfolio: https://agustinsoares.github.io/
- GitHub: https://github.com/agustinsoares
