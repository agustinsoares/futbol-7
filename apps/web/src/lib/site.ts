export const SITE_NAME = 'Aalto Football';

export const SITE_DESCRIPTION =
    'Encuentra partidos de fútbol cerca de ti o crea el tuyo y completa el equipo en minutos.';

// Locale y zona horaria en las que se muestran fechas y horas de los partidos.
export const LOCALE = 'es-ES';
export const TIME_ZONE = 'Europe/Madrid';

export function siteUrl(): URL {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return new URL(explicit);

    // Variable que Vercel inyecta en todos los deploys.
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercel) return new URL(`https://${vercel}`);

    return new URL('http://localhost:3000');
}
