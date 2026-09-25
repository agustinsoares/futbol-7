# ⚽ Aalto Football

Aalto Football es una plataforma web para organizar partidos de fútbol amateur.
Los **hosts** crean partidos (cancha, hora, formato, nivel y plazas) y los **jugadores** los encuentran y se suman.
Es la idea de Playtomic, aplicada al fútbol 5, 7 y 11.

> Estado: en desarrollo. Por ahora solo existe la landing pública. Las cuentas de usuario, la creación de partidos y el buscador son los próximos pasos (ver [Roadmap](#-roadmap)).

---

## 🛠️ Stack

- **Web:** Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4, en `apps/web`
- **Base de datos:** PostgreSQL con Prisma, en `prisma/`
- **Deploy:** Vercel

## 📂 Estructura

```
.
├─ apps/
│  ├─ web/                 # Aplicación Next.js (la que se despliega en Vercel)
│  │  ├─ public/images/    # Imágenes estáticas (optimizadas, WebP)
│  │  └─ src/
│  │     ├─ app/           # Rutas, layout, metadatos, favicon, imagen OG
│  │     ├─ components/    # Header, Footer, MatchCard, iconos…
│  │     ├─ fonts/         # Albert Sans y Nova Square (next/font/local)
│  │     └─ lib/           # Configuración del sitio y formateo de fechas/precios
│  └─ api/                 # Script de prueba de conexión a la base de datos
├─ prisma/                 # Esquema y migraciones
└─ docs/                   # Guía de marca
```

## ⚙️ Desarrollo local

Requisitos: Node.js 20 o superior.

```bash
git clone https://github.com/agustinsoares/futbol-7.git
cd futbol-7
cp .env.example .env

npm install                        # dependencias de la raíz (Prisma)
npm install --prefix apps/web      # dependencias de la web

npm run dev                        # http://localhost:3000
```

Otros comandos:

```bash
npm run build        # build de producción de la web
npm run typecheck    # chequeo de tipos
npx prisma validate  # valida el esquema de la base de datos
```

## 🚀 Deploy en Vercel

En la configuración del proyecto en Vercel, el **Root Directory** debe ser `apps/web`.
Los metadatos usan `VERCEL_PROJECT_PRODUCTION_URL` automáticamente. Si usas un dominio propio, define `NEXT_PUBLIC_SITE_URL`.

## 🗺️ Roadmap

- [x] Landing pública con la marca Aalto Football
- [ ] Cuentas de usuario (Google y enlace mágico por email)
- [ ] Modelo de datos: usuarios, canchas, partidos y jugadores apuntados
- [ ] Crear, editar y cancelar partidos (host)
- [ ] Buscador de partidos con filtros y mapa
- [ ] Sumarse y bajarse de un partido, con lista de espera automática
- [ ] Compartir partido por WhatsApp y partidos privados
- [ ] Recordatorios y exportar al calendario
- [ ] Equipos balanceados, resultados, valoraciones y nivel de jugador
- [ ] Pagos online (desactivado por ahora)

## 🎨 Marca

Colores, tipografías y tono en [`docs/football_league_branding.md`](docs/football_league_branding.md).

## 📄 Licencia

MIT.

## 👤 Autor

**Agustín M. Soares**: [LinkedIn](https://www.linkedin.com/in/agustinsoares) · [Portfolio](https://agustinsoares.github.io/) · [GitHub](https://github.com/agustinsoares)
