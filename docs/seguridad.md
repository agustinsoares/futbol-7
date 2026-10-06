# Seguridad y privacidad: revisión de octubre 2026

Revisé la web pensando como un atacante: qué podría robar, romper o usar en contra de los usuarios. Lo más importante para entender el riesgo es esto: **la clave pública de Supabase está en el navegador** (es normal y está bien). Por lo tanto, cualquiera puede hablar con la base de datos directamente, sin pasar por la web. La protección real son las reglas de la base de datos (RLS) y las funciones con permisos; las comprobaciones de la web son solo una ayuda.

## Lo que encontré y arreglé

| # | Gravedad | Ataque | Qué pasaba | Arreglo |
|---|---|---|---|---|
| 1 | 🔴 Alta | **Listar partidos privados** | Cualquiera, sin cuenta, podía pedir a la API todos los partidos "privados" y quién jugaba en ellos. La privacidad dependía de que la web no los mostrara. | Ahora la base de datos solo los lista para el host, los jugadores y los admins. Quien tiene el enlace los abre con una función que pide el id exacto (`get_match`). |
| 2 | 🔴 Alta | **Robo de datos personales** | Sin cuenta, la API devolvía los nombres de todos los usuarios, en qué partidos juega cada uno (lugar y hora: útil para acosar a alguien) y sus estadísticas. | Los nombres, los jugadores de cada partido y los perfiles solo los ven usuarios registrados. Los visitantes ven los partidos y las plazas libres. |
| 3 | 🟠 Media | **Redirección a una web falsa** (phishing) | Un enlace como `…/login?next=/%09/web-falsa.com` llevaba a otro sitio después de iniciar sesión, por ejemplo a una copia del login para robar contraseñas. | La dirección de destino se valida igual que la interpreta el navegador. Hay tests con los trucos conocidos. |
| 4 | 🟠 Media | **Emails oficiales con texto del atacante** | Las plantillas de Supabase mostraban el nombre del usuario, y ese nombre lo controla quien se registra (también por la API). Alguien podía registrarse con el email de otra persona y un "nombre" con un enlace o texto engañoso, y Supabase lo mandaba desde nuestra dirección. | Las plantillas ya no incluyen datos que escriba el usuario. |
| 5 | 🟠 Media | **Enlaces de email envenenados** | Los enlaces de confirmación y recuperación se armaban con la cabecera `Host` de la petición, que se puede falsear. Supabase ya bloqueaba los dominios ajenos, pero dependíamos solo de eso. | En producción los enlaces usan siempre la URL oficial. |
| 6 | 🟠 Media | **Clickjacking** | Otra web podía cargar la nuestra en un marco invisible y engañar a un admin para que hiciera clic en "Make admin" o en "Delete account". | Cabeceras que prohíben los marcos (`frame-ancestors 'none'`, `X-Frame-Options`), además de una CSP que limita a qué dominios puede conectarse la web. |
| 7 | 🟠 Media | **Spam y abuso por la API** | Una cuenta podía crear miles de partidos, inundar un chat, crear partidos en el pasado o ya "jugados" con un resultado inventado. | Límites en la base de datos: 30 partidos por día, 10 mensajes por minuto, fechas válidas, y los partidos siempre empiezan "abiertos" y sin resultado. |
| 8 | 🟡 Baja | **Datos en el dispositivo** | La app guardaba copias del perfil, el chat y el panel de admin para usarlas sin conexión. En un ordenador compartido, otra persona podía verlas. | Solo se guardan páginas públicas (inicio y listado), y se borraron las cachés antiguas. |
| 9 | 🟡 Baja | Endurecimiento varios | Los visitantes tenían permisos de escritura en las tablas (RLS los frenaba igual). `avatar_url` aceptaba cualquier texto, lo que permitía píxeles de rastreo o textos enormes. El precio no tenía tope. La cabecera `X-Powered-By` revelaba la tecnología. | Permisos de escritura quitados, `avatar_url` limitado a `https` y 500 caracteres, precio máximo de 10 000 NOK, cabecera eliminada. |
| 10 | ⚖️ RGPD | **No se podía borrar la cuenta** | El RGPD obliga a poder borrar tus datos. | Botón "Delete my account" en el perfil. Antes de borrar, la persona se baja de sus partidos futuros, así entra la lista de espera. |

Todo esto está cubierto por tests:
- `supabase/tests/privacy_test.sql` intenta los ataques directamente contra la base de datos.
- `apps/web/e2e/account.mjs` los prueba desde fuera: la API sin sesión, el redirect, las cabeceras y el borrado de cuenta.
- `apps/web/src/lib/__tests__/auth.test.ts` prueba la validación del redirect.

## Lo que ya estaba bien (revisado)

- RLS activado en todas las tablas. Nadie puede darse rol de admin: lo impide un trigger en la base.
- Apuntarse y bajarse pasa por funciones que bloquean la fila, así que no se puede "sobrevender" la última plaza.
- Las valoraciones individuales son privadas, el chat solo lo leen los miembros del partido y las funciones de admin comprueban el rol en la base.
- La clave secreta de Supabase solo se usa en el servidor (la tarea diaria y el borrado de cuentas). La tarea diaria exige `CRON_SECRET`.
- No hay secretos en el historial de git. `npm audit`: 0 vulnerabilidades.
- React escapa todo el texto, no hay HTML inyectado y los popups del mapa escapan los textos. Next.js protege las acciones del servidor contra CSRF.
- La recuperación de contraseña responde lo mismo exista o no la cuenta, así no revela qué emails están registrados.

## Lo que tenés que hacer vos (configuración)

**Supabase** (Authentication):
- [ ] Activar **Leaked password protection** (rechaza contraseñas filtradas en otras webs).
- [ ] Poner la **longitud mínima de contraseña en 8**. La web ya pide 8, pero la API acepta 6.
- [ ] Dejar activado **Confirm email** y activar **Secure email change**.
- [ ] Pegar las 3 plantillas de `supabase/templates/` (confirmación, enlace mágico y recuperación).
- [ ] Si aparecen registros falsos en masa: activar **CAPTCHA (Cloudflare Turnstile)**. Requiere un pequeño cambio en la web.

**Cuentas:**
- [ ] Activar **la verificación en dos pasos (2FA)** en GitHub, Vercel, Supabase, Resend y Google. Si alguien entra a una de esas cuentas, entra a todo.
- [ ] `VERCEL_ANALYTICS_TOKEN`: crearlo con fecha de vencimiento y guardarlo como *Sensitive*.

**Email y dominio** (cuando tengas dominio):
- [ ] Configurar SPF, DKIM y **DMARC**. Sin DMARC, cualquiera puede mandar emails que parecen nuestros.

**Datos:**
- [ ] Copias de seguridad: el plan gratis de Supabase no permite restaurar a un momento concreto (PITR). Antes de tener usuarios reales, conviene el plan Pro o un `pg_dump` periódico.

**GitHub:**
- [ ] Activar Dependabot (alertas de dependencias) y proteger la rama `main` (que no se pueda subir sin pasar la CI).

## Riesgos que quedan (aceptados o para más adelante)

- **Usuarios registrados ven a otros usuarios.** Es parte del producto: quién juega, nivel y estadísticas. Alguien podría crear una cuenta para recopilar nombres. Mitigación futura: límite de peticiones en el Firewall de Vercel.
- **CSP con `'unsafe-inline'` en scripts.** Next.js inyecta scripts propios. Una CSP con *nonces* sería más estricta, pero obliga a renderizar todo dinámicamente. El resto de la CSP (a dónde puede conectarse la web, marcos, formularios) sí está activo.
- **El rol de admin se ve en el perfil** para usuarios registrados. Así se sabe quién es admin (posible objetivo de phishing): de ahí la importancia del 2FA.
- **Borrar la cuenta borra los partidos que organizaba esa persona**, también para los demás jugadores. Está avisado en el texto del borrado.

## Privacidad y documentos legales

Creé dos páginas en la web, en inglés y noruego, enlazadas en el pie de página y en el registro:
- **Privacy policy / Personvernerklæring** (`/en/privacy`, `/nb/privacy`): qué datos se recogen, para qué y con qué base legal, quién los ve, proveedores, transferencias fuera del EEE, plazos, cookies, derechos y cómo reclamar ante Datatilsynet.
- **Terms of use / Vilkår for bruk** (`/en/terms`, `/nb/terms`): qué es el servicio, normas para hosts y jugadores, juego limpio, contenido, riesgo de lesiones, responsabilidad, baja de la cuenta y ley noruega.

**No hace falta un banner de cookies:** solo usamos cookies necesarias (la sesión y el idioma), y Vercel Analytics no usa cookies.

**Antes de lanzar:**
- [ ] **Email de contacto:** poner `NEXT_PUBLIC_CONTACT_EMAIL` en Vercel. Mientras no esté, las páginas muestran "[contact email]". Mejor un email del dominio que tu email personal.
- [ ] **Responsable de los datos:** los textos dicen "Agustín M. Soares, Bergen". Si creás una empresa (por ejemplo un ENK), poné su nombre y número de organización.
- [ ] **Edad mínima:** puse 16 años. Si querés 18 (más prudente en una web para quedar con desconocidos), es un cambio de una línea en `apps/web/src/content/legal.ts`.
- [ ] **Acuerdos de tratamiento de datos (DPA):** aceptarlos en Supabase (Settings → Legal), Vercel y Resend. Normalmente son un clic.
- [ ] **Revisión legal:** los textos son un borrador sólido, pero conviene que los mire alguien con conocimiento de derecho noruego antes de crecer.
- [ ] **Cambios:** si cambiás qué datos se recogen o a qué proveedores se mandan, actualizá la política.
