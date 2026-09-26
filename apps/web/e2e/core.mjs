// Recorrido end-to-end con Playwright contra la app en marcha y Supabase local con el seed.
// Uso: E2E_BASE_URL=http://localhost:3000 node e2e/core.mjs
// Requiere que los usuarios del seed tengan la contraseña 'local-pass-123' (ver README).
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const B = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const SHOTS = process.env.E2E_SCREENSHOTS ?? 'e2e/screenshots';
mkdirSync(SHOTS, { recursive: true });
const out = (n) => `${SHOTS}/${n}.png`;
const launch = () =>
    chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const log = (...a) => console.log(...a);
let failures = 0;
const check = (cond, msg) => {
    log(cond ? '  ✓' : '  ✗', msg);
    if (!cond) failures++;
};

(async () => {
    const b = await launch();
    const errors = [];
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    p.on(
        'console',
        (m) => m.type() === 'error' && !m.text().includes('openstreetmap') && errors.push(m.text()),
    );

    log('1. Listado y filtros');
    await p.goto(`${B}/en/matches`);
    check((await p.locator('ul > li article').count()) === 9, '9 partidos públicos próximos');
    await p.selectOption('select[name=level]', 'beginner');
    await p.click('button:has-text("Show matches")');
    await p.waitForURL(/level=beginner/);
    const beginnerCount = await p.locator('ul > li article').count();
    check(beginnerCount > 0 && beginnerCount < 9, `filtro de nivel: ${beginnerCount} partidos`);
    await p.screenshot({ path: out('01-list-filtered'), fullPage: true });

    log('2. Detalle anónimo');
    await p.goto(`${B}/en/matches`);
    await p.click('text=Indoor 5-a-side for beginners');
    await p.waitForURL(/\/en\/matches\/[0-9a-f-]{36}$/);
    const indoorUrl = p.url();
    check(await p.isVisible('text=Sign in to join'), 'muestra "Sign in to join"');
    check(await p.isVisible('text=Hosted by'), 'muestra el host');

    log('3. Login con error y luego correcto');
    await p.click('text=Sign in to join');
    await p.fill('#email', 'player@aaltofootball.test');
    await p.fill('#password', 'wrong-password');
    await p.click('form button[type=submit]:has-text("Sign in")');
    await p.waitForSelector('text=Wrong email or password.');
    check(true, 'error de credenciales');
    await p.fill('#password', 'local-pass-123');
    await p.click('form button[type=submit]:has-text("Sign in")');
    await p.waitForURL(indoorUrl, { waitUntil: 'commit' });
    check(true, 'vuelve al partido tras login');
    check(await p.isVisible("text=You're in!"), 'el jugador demo ya estaba en este partido');
    await p.waitForSelector('summary[aria-label="Open account menu"]');
    check(true, 'header muestra menú de usuario');
    await p.screenshot({ path: out('02-match-detail-in'), fullPage: true });

    log('4. Bajarse y volver a sumarse');
    const countText = async () => (await p.textContent('#players-title')).replace(/\s+/g, ' ');
    const before = await countText();
    await p.click('button:has-text("Leave match")');
    await p.waitForSelector('button:has-text("Join match")');
    const afterLeave = await countText();
    check(before !== afterLeave, `plazas: ${before} -> ${afterLeave}`);
    await p.click('button:has-text("Join match")');
    await p.waitForSelector("text=You're in!");
    check((await countText()) === before, 'vuelve al conteo original');

    log('5. Partido lleno: lista de espera');
    await p.goto(`${B}/en/matches?format=5v5`);
    await p.click('text=Lunchtime futsal-style 5s');
    await p.waitForURL(/\/matches\//);
    check(await p.isVisible('text=on the waitlist'), 'el jugador demo está en lista de espera (#1)');
    await p.click('button:has-text("Leave the waitlist")');
    await p.waitForSelector('button:has-text("Join the waitlist")');
    check(true, 'se puede salir de la lista de espera');
    await p.click('button:has-text("Join the waitlist")');
    await p.waitForSelector('text=on the waitlist');
    check(true, 'y volver a entrar');

    log('6. Crear partido');
    await p.goto(`${B}/en/matches/new`);
    await p.fill('#title', 'ab');
    await p.fill('#description', 'Keep this text');
    await p.click('button:has-text("Create match")');
    await p.waitForSelector('text=The title must have 3–120 characters.');
    check(await p.isVisible('text=Choose a pitch.'), 'validación: título y cancha');
    check(
        (await p.inputValue('#title')) === 'ab' && (await p.inputValue('#description')) === 'Keep this text',
        'el formulario conserva lo escrito tras el error',
    );
    await p.fill('#title', 'E2E Friday 7s');
    await p.selectOption('#venueId', { label: 'Frescohallen (Fana)' });
    const d = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    await p.fill('#date', d);
    await p.fill('#time', '19:30');
    await p.selectOption('#format', '7v7');
    await p.fill('#price', '90');
    await p.fill('#description', 'Bring a dark shirt.');
    await p.screenshot({ path: out('03-new-match-form'), fullPage: true });
    await p.click('button:has-text("Create match")');
    await p.waitForURL(/\/en\/matches\/[0-9a-f-]{36}$/);
    const newUrl = p.url();
    check(await p.isVisible('h1:has-text("E2E Friday 7s")'), 'redirige al partido creado');
    check((await countText()).includes('1/14'), 'el host ocupa la primera plaza (1/14)');
    check(await p.isVisible('text=19:30–20:30'), 'hora 19:30–20:30 en hora de Bergen');
    check(
        (await p.isVisible('text=kr 90')) ||
            (await p.isVisible('text=NOK 90')) ||
            (await p.textContent('dl')).includes('90'),
        'precio 90 NOK',
    );

    log('7. Editar partido');
    await p.click('text=Edit match');
    await p.fill('#maxPlayers', '10');
    await p.fill('#title', 'E2E Friday 5s');
    await p.click('button:has-text("Save changes")');
    await p.waitForURL(newUrl, { waitUntil: 'commit' });
    check(await p.isVisible('h1:has-text("E2E Friday 5s")'), 'título editado');
    check((await countText()).includes('1/10'), 'cupo editado a 10');

    log('8. Calendario (.ics)');
    const icsHref = await p.getAttribute('a:has-text("Add to calendar")', 'href');
    const ics = await (await ctx.request.get(B + icsHref)).text();
    check(
        ics.startsWith('BEGIN:VCALENDAR') &&
            ics.includes('SUMMARY:⚽ E2E Friday 5s') &&
            ics.includes('Frescohallen'),
        'ics válido',
    );

    log('9. Mis partidos');
    await p.goto(`${B}/en/my-matches`);
    check(await p.isVisible('text=E2E Friday 5s'), 'aparece el partido creado en "Hosting"');
    check(await p.isVisible('text=Lunchtime futsal-style 5s'), 'aparece el partido en lista de espera');
    await p.screenshot({ path: out('04-my-matches'), fullPage: true });

    log('10. Cancelar partido');
    await p.goto(newUrl);
    p.once('dialog', (dlg) => dlg.accept());
    await p.click('button:has-text("Cancel match")');
    await p.waitForSelector('text=This match has been cancelled.');
    check(true, 'partido cancelado');

    log('11. Perfil');
    await p.goto(`${B}/en/profile`);
    await p.selectOption('#position', 'goalkeeper');
    await p.click('button:has-text("Save profile")');
    await p.waitForSelector('text=Profile saved.');
    check(true, 'perfil guardado');

    log('12. Otro usuario no puede editar');
    await p.goto(`${B}/en/matches`);
    await p.click('text=After-work 7-a-side');
    await p.waitForURL(/\/matches\//);
    check(!(await p.isVisible('text=Edit match')), 'sin botón de editar en partido ajeno');
    await p.goto(p.url() + '/edit');
    check(await p.isVisible("text=You can't edit this match."), 'la página de edición lo bloquea');

    log('13. Cerrar sesión');
    await p.click('summary[aria-label="Open account menu"]');
    await p.click('button:has-text("Sign out")');
    await p.waitForURL(`${B}/en`);
    await p.waitForSelector('header a:has-text("Sign in")');
    check(true, 'sesión cerrada');

    log('14. Registro nuevo + onboarding (en noruego)');
    await p.goto(`${B}/nb/login?mode=signup&next=/nb/matches`);
    await p.fill('#fullName', 'Kari Nordmann');
    await p.fill('#email', `kari${Date.now()}@aaltofootball.test`);
    await p.fill('#password', 'short');
    await p.click('button:has-text("Opprett konto")');
    await p.waitForSelector('text=Passordet må ha minst 8 tegn.');
    check(true, 'validación de contraseña en noruego');
    check((await p.inputValue('#fullName')) === 'Kari Nordmann', 'conserva el nombre tras el error');
    await p.fill('#password', 'long-enough-pass');
    await p.click('button:has-text("Opprett konto")');
    await p.waitForURL(/\/nb\/profile\?welcome=1/, { waitUntil: 'commit' });
    check(await p.isVisible('text=Velkommen til Aalto Football!'), 'onboarding de bienvenida');
    await p.selectOption('#skillLevel', 'beginner');
    await p.click('button:has-text("Lagre profil")');
    await p.waitForURL(`${B}/nb/matches`, { waitUntil: 'commit' });
    check(true, 'tras el onboarding vuelve a /nb/matches');
    await p.screenshot({ path: out('05-nb-matches-logged-in'), fullPage: false });

    log('15. Detalle en noruego y móvil');
    const m = await b.newPage({ viewport: { width: 390, height: 844 } });
    await m.goto(indoorUrl.replace('/en/', '/nb/'));
    check(await m.isVisible('text=Logg inn for å melde deg på'), 'CTA en noruego');
    const sw = await m.evaluate(() => document.documentElement.scrollWidth);
    check(sw <= 390, `sin scroll horizontal en móvil (${sw})`);
    await m.screenshot({ path: out('06-nb-detail-mobile'), fullPage: true });

    console.log('\nJS errors:', errors.length ? errors : 'none');
    console.log(failures ? `\n${failures} FAILURES` : '\nALL CHECKS PASSED');
    if (failures || errors.length) process.exitCode = 1;
    await b.close();
})().catch((e) => {
    console.error('E2E crashed:', e.message);
    process.exit(1);
});
