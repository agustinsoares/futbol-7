# ⚽ LigaF7 – Amateur Football League Management Platform

## 📌 Overview
LigaF7 is a full-stack web application for managing amateur 7-a-side football leagues.  
It allows organizers to create tournaments, register teams, schedule matches, track results, generate standings, and manage payments.

This project is **fictional but fully functional** – designed to showcase modern full-stack skills for a portfolio.

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
- Responsive UI (mobile-first, also optimized for desktop)  
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
git clone https://github.com/YOUR_USERNAME/ligaf7.git
cd ligaf7
```

### 2. Environment variables
Copy the example file and set your local values:
```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL connection:
```
DATABASE_URL="postgresql://futbol_app:YOUR_PASSWORD@localhost:5432/futbol_dev?schema=public"
NEXTAUTH_SECRET="changeme"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

### 3. Run with Docker (recommended for local dev)
```bash
docker compose up -d
```

### 4. Migrate & seed database
```bash
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts
```

### 5. Start development

Frontend:
```bash
cd apps/web
npm run dev
```

Backend:
```bash
cd apps/api
npm run start:dev
```

### 6. Stop the project
If it’s running in the terminal → press:
```
CTRL + C
```

---

## 🔍 Useful commands
- **Format Prisma schema**
```bash
npx prisma format
```

- **Check DB schema validity**
```bash
npx prisma validate
```

- **View migrations history**
```bash
npx prisma migrate status
```

- **Run tests**
```bash
npm test
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
- LinkedIn: [linkedin.com/in/agustinsoares](https://www.linkedin.com/in/agustinsoares)  
- Portfolio: [agustinsoares.github.io](https://agustinsoares.github.io/)  
- GitHub: [github.com/agustinsoares](https://github.com/agustinsoares)  
