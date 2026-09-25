import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { supabaseEnv } from './env';

/**
 * Cliente con la sesión del usuario (lee y renueva las cookies de auth).
 * Úsalo en Server Components, Server Actions y Route Handlers que dependan de quién está logueado.
 */
export async function createSupabaseServerClient() {
    const env = supabaseEnv();
    if (!env) throw new Error('Supabase no está configurado (faltan NEXT_PUBLIC_SUPABASE_*).');
    const cookieStore = await cookies();

    return createServerClient<Database>(env.url, env.publishableKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Llamado desde un Server Component: no puede escribir cookies.
                    // La sesión se refresca en Server Actions / Route Handlers.
                }
            },
        },
    });
}

/**
 * Cliente anónimo sin cookies, para datos públicos en páginas estáticas o con ISR.
 * Devuelve null si Supabase no está configurado.
 */
export function createSupabasePublicClient() {
    const env = supabaseEnv();
    if (!env) return null;
    return createClient<Database>(env.url, env.publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
