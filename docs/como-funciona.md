# Aalto Football: cómo funciona

Aalto Football es una web para jugar al fútbol en Bergen (Noruega). Funciona como Playtomic, pero para partidos de fútbol: alguien **organiza** un partido (el *host*) y otras personas **se apuntan**. Está en inglés y en noruego, y se puede instalar en el móvil como una app (PWA).

## Qué puede hacer cada persona

| Quién | Qué puede hacer |
|---|---|
| **Visitante** (sin cuenta) | Ver los partidos públicos, el mapa y cuántas plazas quedan. No ve nombres de jugadores. |
| **Jugador** (con cuenta) | Apuntarse o bajarse de partidos (con lista de espera), chatear con su partido, valorar a los compañeros después de jugar, ver perfiles y estadísticas, añadir el partido al calendario, cambiar o recuperar la contraseña y borrar su cuenta. |
| **Host** (cualquier jugador) | Crear partidos (sueltos o semanales, públicos o privados), editarlos o cancelarlos, armar equipos equilibrados y apuntar el resultado y quién vino. |
| **Admin** | Lo anterior en cualquier partido, más el panel `/admin`: estadísticas, tráfico de la web, gestión de canchas y elegir quién más es admin. |

Un partido **privado** no aparece en los listados: solo entra quien tiene el enlace.

## El recorrido de un partido

1. El host crea el partido: cancha, día, formato (5, 7, 9 u 11 por lado), nivel, plazas y precio. El pago se hace en la cancha; la web no cobra.
2. Los jugadores se apuntan. Cuando se llena, los siguientes van a la lista de espera. Si alguien se baja, entra automáticamente el primero de la lista.
3. El día anterior, cada jugador recibe un email recordatorio.
4. El día del partido, el host arma los equipos (la web los equilibra por nivel).
5. Después, el host apunta el resultado y la asistencia, y los jugadores se valoran entre sí. Solo se publica la media de las valoraciones.
6. Si nadie pone el resultado, el partido se marca como jugado solo, unas horas después de terminar.

## Cómo está hecha (por dentro)

```
Navegador / app ──► Vercel (Next.js, la web) ──► Supabase (base de datos + cuentas)
                          │                              ▲
                          ├─► Resend (emails)            │
                          └─► Tarea diaria 06:00 UTC ────┘ (recordatorios y cierre de partidos)
```

- **Next.js en Vercel** (`apps/web`): las páginas, los formularios y las acciones del servidor.
- **Supabase** (`supabase/`): base de datos Postgres en la UE (Irlanda) y login (email y contraseña, enlace por email, Google opcional). Las reglas de quién puede ver o cambiar cada dato están **en la base de datos** (RLS), no solo en la web. Así, aunque alguien use la API directamente, no puede saltárselas.
- **Resend**: envía los recordatorios. Los emails de cuenta (confirmar, enlace mágico, recuperar contraseña) los envía Supabase con las plantillas de `supabase/templates/`.
- **Vercel Web Analytics**: estadísticas de visitas sin cookies.

## Dónde está cada cosa

| Necesito… | Dónde |
|---|---|
| Cambiar un texto de la web | `apps/web/src/i18n/dictionaries/en.ts` y `nb.ts` |
| Cambiar privacidad o términos | `apps/web/src/content/legal.ts` |
| Cambiar la base de datos | Nueva migración en `supabase/migrations/` |
| Cambiar los emails de cuenta | `supabase/templates/` (y pegarlos en Supabase) |
| Variables y configuración | `README.md` y `.env.example` |
| Seguridad y privacidad | `docs/seguridad.md` |

## Cómo se comprueba que todo funciona

Cada cambio pasa por GitHub Actions: formato, lint, tipos, tests unitarios, build y tres recorridos end-to-end con un navegador real contra una base de datos local. Los recorridos prueban registro, partidos, día de partido, contraseña, panel de admin, privacidad y borrado de cuenta.
