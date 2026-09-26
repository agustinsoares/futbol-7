// Recorrido end-to-end con Playwright contra la app en marcha y Supabase local con el seed.
// Uso: E2E_BASE_URL=http://localhost:3000 node e2e/features.mjs
// Requiere que los usuarios del seed tengan la contraseña 'local-pass-123' (ver README).
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const B = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const SHOTS = process.env.E2E_SCREENSHOTS ?? 'e2e/screenshots';
mkdirSync(SHOTS, { recursive: true });
const out = (n) => `${SHOTS}/${n}.png`;
const launch = () =>
    chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
let failures = 0;
const check = (cond, msg) => {
    console.log(cond ? '  ✓' : '  ✗', msg);
    if (!cond) failures++;
};

async function login(b, email) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${email}: ${e.message}`));
    await p.goto(`${B}/en/login?next=/en/matches`);
    await p.fill('#email', email);
    await p.fill('#password', 'local-pass-123');
    await p.click('form button[type=submit]:has-text("Sign in")');
    await p.waitForURL(`${B}/en/matches`, { waitUntil: 'commit' });
    await p.waitForSelector('summary[aria-label="Open account menu"]');
    return p;
}
async function openMatch(p, title) {
    await p.goto(`${B}/en/matches`);
    await p.click(`text=${title}`);
    await p.waitForURL(/\/en\/matches\/[0-9a-f-]{36}$/, { waitUntil: 'commit' });
    await p.waitForSelector('h1');
    return p.url();
}
const errors = [];

(async () => {
    const b = await launch();

    console.log('1. Equipos balanceados (host: Ingrid)');
    const host = await login(b, 'ingrid.haugland@aaltofootball.test');
    const indoor = await openMatch(host, 'Indoor 5-a-side for beginners');
    await host.click('button:has-text("Make balanced teams")');
    await host.waitForSelector('text=Strength');
    const strengths = await host.locator('text=/Strength \\d+/').allTextContents();
    check(strengths.length === 2, `dos equipos con fuerza: ${strengths.join(' vs ')}`);
    await host.click('button:has-text("Shuffle again")');
    await host.click('button:has-text("Save teams")');
    await host.waitForTimeout(1500);
    await host.screenshot({ path: out('10-teams-host'), fullPage: true });

    console.log('2. Chat');
    await host.fill('#chat-body', 'Bring a light and a dark shirt, please!');
    await host.click('button:has-text("Send")');
    await host.waitForSelector('text=Bring a light and a dark shirt, please!');
    check(true, 'el host publica en el chat');
    const player = await login(b, 'player@aaltofootball.test');
    await player.goto(indoor);
    check(
        await player.isVisible('text=Bring a light and a dark shirt, please!'),
        'un jugador apuntado ve el mensaje',
    );
    check(
        (await player.isVisible('text=Team A')) && (await player.isVisible('text=Team B')),
        'el jugador ve los equipos guardados',
    );
    const anon = await (await b.newContext()).newPage();
    await anon.goto(indoor);
    check(
        await anon.isVisible('text=Join the match to see and write in the chat.'),
        'un anónimo no ve el chat',
    );
    check(!(await anon.isVisible('text=Bring a light and a dark shirt, please!')), 'ni el mensaje');

    console.log('3. Resultado y asistencia (host de un partido pasado: admin)');
    const admin = await login(b, 'admin@aaltofootball.test');
    // El partido pasado no está en el listado (completed): lo buscamos en Mis partidos → Past.
    await admin.goto(`${B}/en/my-matches`);
    await admin.click("text=Last week's 7s");
    await admin.waitForURL(/\/en\/matches\/[0-9a-f-]{36}$/, { waitUntil: 'commit' });
    await admin.waitForSelector('text=Record the result');
    await admin.fill('input[name=scoreA]', '4');
    await admin.fill('input[name=scoreB]', '2');
    const boxes = admin.locator('input[name=attended]');
    const noShowId = await boxes.nth(1).getAttribute('value');
    await boxes.nth(1).uncheck();
    await admin.click('button:has-text("Save result")');
    await admin.waitForSelector('text=Edit result');
    check(
        (await admin.textContent('#result-title + p')).replace(/\s+/g, ' ').includes('4 – 2'),
        'resultado 4 – 2 visible',
    );

    console.log('4. Valoraciones');
    await admin.waitForSelector('text=Rate the players');
    const firstStars = admin.locator('fieldset.stars').first().locator('label').nth(0); // 5 estrellas
    await firstStars.click();
    await admin.locator('fieldset.stars').nth(1).locator('label').nth(3).click(); // 2 estrellas
    await admin.click('button:has-text("Save ratings")');
    await admin.waitForSelector('text=Thanks! Your ratings were saved.');
    check(true, 'valoraciones guardadas');
    await admin.screenshot({ path: out('11-result-ratings'), fullPage: true });

    console.log('5. Perfil de jugador con estadísticas');
    await admin.goto(`${B}/en/players/${noShowId}`);
    const tiles = (await admin.textContent('dl')).replace(/\s+/g, ' ');
    check(
        /No-shows|no-shows/i.test(tiles) && tiles.includes('0 %'),
        `ficha con asistencia y no-show: "${tiles.slice(0, 120)}"`,
    );
    await admin.screenshot({ path: out('12-player-profile'), fullPage: true });

    console.log('6. Admin: canchas');
    await admin.goto(`${B}/en/admin/venues`);
    check(await admin.isVisible('text=Frescohallen'), 'lista de canchas');
    await admin.click('text=Add a pitch');
    await admin.fill('#name', 'E2E Nygårdsparken');
    await admin.fill('#address', 'Nygårdsparken, 5015 Bergen');
    await admin.fill('#area', 'Sentrum');
    await admin.fill('#lat', '60.3861');
    await admin.fill('#lng', '5.3285');
    await admin.click('button:has-text("Save pitch")');
    await admin.waitForURL(`${B}/en/admin/venues`, { waitUntil: 'commit' });
    await admin.waitForSelector('text=E2E Nygårdsparken');
    check(true, 'cancha creada');
    await admin.click('li:has-text("Frescohallen") >> text=Edit');
    admin.once('dialog', (d) => d.accept());
    await admin.click('button:has-text("Delete pitch")');
    await admin.waitForSelector("text=This pitch has matches, so it can't be deleted.");
    check(true, 'no deja borrar una cancha con partidos');
    await player.goto(`${B}/en/admin/venues`);
    check(await player.isVisible('text=Only admins can manage pitches.'), 'un jugador no entra al admin');

    console.log('7. Mapa');
    await player.goto(`${B}/en/matches?view=map`);
    await player.waitForSelector('.map-pin', { timeout: 15000 });
    const pins = await player.locator('.map-pin').count();
    check(pins >= 5, `marcadores en el mapa: ${pins}`);
    await player.locator('.map-pin').first().click();
    await player.waitForSelector('.map-popup-title');
    check(true, 'popup con partidos');
    await player.screenshot({ path: out('13-map'), fullPage: false });

    console.log('8. Partido semanal (3 semanas)');
    await player.goto(`${B}/en/matches/new`);
    await player.fill('#title', 'E2E Weekly Thursday');
    await player.selectOption('#venueId', { label: 'Åsane Arena (Åsane)' });
    await player.fill('#date', new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));
    await player.fill('#time', '20:00');
    await player.check('input[name=repeat]');
    await player.selectOption('#weeks', '3');
    await player.click('button:has-text("Create match")');
    await player.waitForURL(/\/en\/matches\/[0-9a-f-]{36}$/, { waitUntil: 'commit' });
    await player.waitForSelector('text=Weekly match');
    check(true, 'partido creado con la etiqueta "Weekly match"');
    await player.goto(`${B}/en/my-matches`);
    const weekly = await player.locator('text=E2E Weekly Thursday').count();
    check(weekly === 3, `aparecen 3 partidos semanales en Mis partidos (${weekly})`);

    console.log('9. Cron diario');
    const unauthorized = await (await b.newContext()).request.get(`${B}/api/cron/daily`);
    check(unauthorized.status() === 401, 'sin secreto: 401');
    const res = await (
        await b.newContext()
    ).request.get(`${B}/api/cron/daily`, { headers: { authorization: 'Bearer local-cron-secret' } });
    const json = await res.json();
    check(
        res.status() === 200 && typeof json.remindersDue === 'number',
        `cron responde: ${JSON.stringify(json)}`,
    );

    console.log('\nJS errors:', errors.length ? errors : 'none');
    console.log(failures ? `\n${failures} FAILURES` : '\nALL CHECKS PASSED');
    if (failures || errors.length) process.exitCode = 1;
    await b.close();
})().catch((e) => {
    console.error('E2E crashed:', e.message.split('\n').slice(0, 6).join('\n'));
    process.exit(1);
});
