/** @type {import('next').NextConfig} */

// Cabeceras de seguridad (ver docs/seguridad.md).
// - CSP: solo recursos propios, Supabase (API) y OpenStreetMap (mapas). 'unsafe-inline' en scripts
//   porque Next.js inyecta scripts inline; aun así, connect-src impide mandar datos a otros dominios.
// - frame-ancestors / X-Frame-Options: nadie puede meter el sitio en un iframe (clickjacking).
function securityHeaders() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : '';
    const dev = process.env.NODE_ENV === 'development';
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://tile.openstreetmap.org",
        "font-src 'self'",
        `connect-src 'self' ${supabaseOrigin}`.trim(),
        'frame-src https://www.openstreetmap.org',
        "worker-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        dev ? '' : 'upgrade-insecure-requests',
    ]
        .filter(Boolean)
        .join('; ');

    return [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];
}

const nextConfig = {
    poweredByHeader: false,
    turbopack: {
        root: __dirname,
    },
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders() }];
    },
    async redirects() {
        // La antigua landing de ligas vivía en /dashboard.
        return [{ source: '/dashboard', destination: '/', permanent: false }];
    },
};

module.exports = nextConfig;
