import 'server-only';
import { headers } from 'next/headers';
import { siteUrl } from './site';

/**
 * Origen para construir enlaces (emails de confirmación, recuperación, compartir).
 * En producción siempre es la URL oficial: nunca se fía de la cabecera Host, que un atacante
 * podría falsear para que el enlace del email apunte a su dominio. En previews y en local se usa
 * el host de la request (Supabase solo acepta los dominios de su lista de redirecciones).
 */
export async function requestOrigin(): Promise<string> {
    if (process.env.VERCEL_ENV === 'production') return siteUrl().origin;
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (!host) return siteUrl().origin;
    const proto =
        h.get('x-forwarded-proto') ??
        (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
    return `${proto}://${host}`;
}
