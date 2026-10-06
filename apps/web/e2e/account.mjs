// Recuperar contraseña (con el email real de Supabase local, vía Mailpit) y panel de administración.
// Uso: E2E_BASE_URL=http://localhost:3000 node e2e/account.mjs
// Requiere Supabase local con el seed y la contraseña 'local-pass-123' para sus usuarios (ver README).
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const B = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const MAILPIT = process.env.E2E_MAILPIT_URL ?? 'http://127.0.0.1:54324';
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
const errors = [];
const RESET_USER = 'sofie.berg@aaltofootball.test';
const NEW_PASSWORD = 'new-pass-456';

async function newPage(b) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    return p;
}

async function login(b, email, password = 'local-pass-123') {
    const p = await newPage(b);
    await p.goto(`${B}/en/login?next=/en/matches`);
    await p.fill('#email', email);
    await p.fill('#password', password);
    await p.click('form button[type=submit]:has-text("Sign in")');
    await p.waitForURL(`${B}/en/matches`, { waitUntil: 'commit' });
    await p.waitForSelector('summary[aria-label="Open account menu"]');
    return p;
}

/** Espera el último email para `to` en Mailpit y devuelve { subject, html }. */
async function latestEmail(to, since) {
    for (let i = 0; i < 30; i++) {
        const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`);
        const { messages = [] } = await res.json();
        const msg = messages.find((m) => new Date(m.Created) >= since);
        if (msg) {
            const full = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json();
            return { subject: full.Subject, html: full.HTML };
        }
        await new Promise((r) => setTimeout(r, 500));
    }
    return null;
}

(async () => {
    const b = await launch();

    console.log('Forgot / reset password');
    const p = await newPage(b);
    await p.goto(`${B}/en/login`);
    await p.click('text=Forgot your password?');
    await p.waitForURL(`${B}/en/forgot-password`, { waitUntil: 'commit' });
    await p.fill('#email', 'not-an-email');
    await p.click('button:has-text("Send reset link")');
    check(!!(await p.waitForSelector('text=Enter a valid email address.')), 'invalid email is rejected');
    const since = new Date(Date.now() - 1000);
    await p.fill('#email', RESET_USER);
    await p.click('button:has-text("Send reset link")');
    await p.waitForSelector('text=a reset link is on its way');
    check(true, 'request shows the neutral confirmation');
    await p.screenshot({ path: out('account-01-forgot-sent') });

    const email = await latestEmail(RESET_USER, since);
    check(!!email, 'recovery email arrives');
    check(email?.subject === 'Reset your Aalto Football password', `subject is branded (${email?.subject})`);
    const link = email?.html.match(/href="([^"]*token_hash=[^"]*)"/)?.[1]?.replaceAll('&amp;', '&');
    check(
        !!link && link.includes('type=recovery') && link.includes('/en/auth/callback'),
        'link goes to our callback',
    );

    const r = await newPage(b);
    await r.goto(link);
    await r.waitForURL(`${B}/en/reset-password`, { waitUntil: 'commit' });
    await r.waitForSelector('#password');
    check(true, 'link opens the new-password form (works in a fresh browser)');
    await r.fill('#password', NEW_PASSWORD);
    await r.fill('#confirm', 'something-else');
    await r.click('button:has-text("Save password")');
    check(
        !!(await r.waitForSelector("text=The passwords don't match.")),
        'mismatched passwords are rejected',
    );
    await r.fill('#password', NEW_PASSWORD);
    await r.fill('#confirm', NEW_PASSWORD);
    await r.click('button:has-text("Save password")');
    await r.waitForSelector('text=Your password has been changed.');
    check(true, 'password is saved');
    await r.screenshot({ path: out('account-02-reset-done') });

    const again = await login(b, RESET_USER, NEW_PASSWORD);
    check(again.url() === `${B}/en/matches`, 'can sign in with the new password');
    const anon = await newPage(b);
    await anon.goto(`${B}/en/reset-password`);
    check(await anon.isVisible('text=Request a new link'), 'reset page without a session asks for a link');

    console.log('Admin panel');
    const player = await login(b, 'player@aaltofootball.test');
    await player.goto(`${B}/en/admin`);
    check(
        await player.isVisible('text=Only site admins can see this page.'),
        'non-admins are kept out of /admin',
    );
    await player.goto(`${B}/en/admin/users`);
    check(
        await player.isVisible('text=Only site admins can see this page.'),
        'non-admins are kept out of /admin/users',
    );

    const admin = await login(b, 'admin@aaltofootball.test');
    await admin.click('summary[aria-label="Open account menu"]');
    await admin.click('a:has-text("Admin")');
    await admin.waitForURL(`${B}/en/admin`, { waitUntil: 'commit' });
    await admin.waitForSelector('h2:has-text("Community")');
    check(await admin.isVisible('text=Players'), 'overview shows the community stats');
    check(await admin.isVisible('text=Most used pitches'), 'overview shows the top pitches');
    check(
        await admin.isVisible('text=Connect Vercel Web Analytics'),
        'traffic explains how to connect Vercel Analytics',
    );
    const chart = admin.locator('figure').first();
    const bars = chart.locator('[tabindex="0"]');
    await bars.last().hover();
    check(await bars.last().locator('[role=tooltip]').isVisible(), 'hovering a bar shows its value');
    check((await chart.locator('.border-dashed').count()) === 1, 'dashed line marks the highest bar');
    await admin.screenshot({ path: out('account-03-admin-overview'), fullPage: true });

    await admin.click('nav[aria-label=Admin] >> text=Admins');
    await admin.waitForURL(`${B}/en/admin/users`, { waitUntil: 'commit' });
    await admin.fill('#q', 'player@aaltofootball');
    await admin.click('button:has-text("Search")');
    await admin.waitForURL(/q=player/, { waitUntil: 'commit' });
    await admin.click('button:has-text("Make admin")');
    await admin.waitForSelector('button:has-text("Remove admin")');
    check(true, 'admin promotes a player');
    await player.goto(`${B}/en/admin`);
    await player.waitForSelector('h2:has-text("Community")');
    check(true, 'the promoted player can open the panel');
    await admin.click('button:has-text("Remove admin")');
    await admin.waitForSelector('button:has-text("Make admin")');
    check(true, 'admin removes the role again');
    await player.goto(`${B}/en/admin`);
    check(await player.isVisible('text=Only site admins can see this page.'), 'the player loses access');
    await admin.goto(`${B}/en/admin/users?q=admin@aaltofootball`);
    check(!(await admin.isVisible('button:has-text("Remove admin")')), 'admins cannot remove their own role');
    await admin.screenshot({ path: out('account-04-admin-users') });

    console.log('Security and privacy');
    const res = await fetch(`${B}/en`);
    const csp = res.headers.get('content-security-policy') ?? '';
    check(
        csp.includes("frame-ancestors 'none'") && res.headers.get('x-frame-options') === 'DENY',
        'anti-clickjacking headers',
    );
    check(res.headers.get('x-content-type-options') === 'nosniff', 'nosniff header');
    check(!res.headers.get('x-powered-by'), 'no x-powered-by header');

    const api = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (api && key) {
        const rest = (path) =>
            fetch(`${api}/rest/v1/${path}`, { headers: { apikey: key } }).then((r) => r.json());
        const priv = await rest('matches?select=id&visibility=eq.private');
        check(Array.isArray(priv) && priv.length === 0, 'API: anonymous cannot list private matches');
        const profiles = await rest('profiles?select=full_name');
        check(Array.isArray(profiles) && profiles.length === 0, 'API: anonymous cannot list player names');
        const players = await rest('match_participants?select=user_id');
        check(Array.isArray(players) && players.length === 0, 'API: anonymous cannot list who plays where');
    } else {
        console.log('  (skipping API checks: NEXT_PUBLIC_SUPABASE_URL / KEY not set)');
    }

    const redirectTo = await newPage(b);
    await redirectTo.goto(`${B}/en/login?next=${encodeURIComponent('/\t/example.com')}`);
    await redirectTo.fill('#email', 'player@aaltofootball.test');
    await redirectTo.fill('#password', 'local-pass-123');
    await redirectTo.click('form button[type=submit]:has-text("Sign in")');
    await redirectTo.waitForURL((url) => url.pathname === '/en/matches', { waitUntil: 'commit' });
    check(
        new URL(redirectTo.url()).origin === new URL(B).origin,
        'login ?next cannot send you to another site',
    );

    const legal = await newPage(b);
    await legal.goto(`${B}/en`);
    await legal.click('footer >> text=Privacy');
    await legal.waitForSelector('h1:has-text("Privacy policy")');
    check(await legal.isVisible('text=Datatilsynet'), 'privacy policy page');
    await legal.goto(`${B}/nb/terms`);
    check(await legal.isVisible('h1:has-text("Vilkår for bruk")'), 'terms page in Norwegian');
    await legal.goto(`${B}/en/login?mode=signup`);
    check(await legal.isVisible('text=By creating an account you accept the'), 'sign-up mentions the terms');

    console.log('Delete account');
    const leaver = await login(b, 'thea.kvamme@aaltofootball.test');
    await leaver.goto(`${B}/en/profile`);
    await leaver.click('summary:has-text("Delete my account")');
    await leaver.click('button:has-text("Delete my account")');
    check(!!(await leaver.waitForSelector('text=Tick the box to confirm.')), 'deletion needs confirmation');
    await leaver.check('input[name=confirm]');
    await leaver.click('button:has-text("Delete my account")');
    await leaver.waitForSelector('text=Your account and data have been deleted.');
    check(true, 'account is deleted and the user is signed out');
    const gone = await newPage(b);
    await gone.goto(`${B}/en/login`);
    await gone.fill('#email', 'thea.kvamme@aaltofootball.test');
    await gone.fill('#password', 'local-pass-123');
    await gone.click('form button[type=submit]:has-text("Sign in")');
    check(!!(await gone.waitForSelector('text=Wrong email or password.')), 'deleted account cannot sign in');

    await b.close();
    check(errors.length === 0, `no page errors${errors.length ? `: ${errors.join(' | ')}` : ''}`);
    console.log(failures ? `\n${failures} check(s) failed` : '\nAll account checks passed');
    process.exit(failures ? 1 : 0);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
