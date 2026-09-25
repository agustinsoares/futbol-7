import 'server-only';
import { headers } from 'next/headers';
import { siteUrl } from './site';

/** Origen de la request actual (sirve también para los deploys de preview de Vercel). */
export async function requestOrigin(): Promise<string> {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (!host) return siteUrl().origin;
    const proto =
        h.get('x-forwarded-proto') ??
        (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
    return `${proto}://${host}`;
}
