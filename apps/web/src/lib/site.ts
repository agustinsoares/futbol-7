export const SITE_NAME = 'Aalto Football';

// Bergen: fechas y horas siempre en hora de Noruega, precios en coronas.
export const TIME_ZONE = 'Europe/Oslo';
export const CURRENCY = 'NOK';

export const BRAND_BLUE = '#2979ff';

export function siteUrl(): URL {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return new URL(explicit);

    // Variable que Vercel inyecta en todos los deploys.
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercel) return new URL(`https://${vercel}`);

    return new URL('http://localhost:3000');
}
