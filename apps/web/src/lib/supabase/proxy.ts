import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';
import { supabaseEnv } from './env';

/**
 * Refresca la sesión de Supabase en cada request (los tokens caducan) y copia las
 * cookies nuevas a la respuesta. Recomendado por @supabase/ssr para Next.js.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
    let response = NextResponse.next({ request });
    const env = supabaseEnv();
    if (!env) return response;

    const supabase = createServerClient<Database>(env.url, env.publishableKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options),
                );
            },
        },
    });

    // getClaims valida el JWT (y lo renueva si hace falta). No hay que meter código entre
    // createServerClient y esta llamada.
    await supabase.auth.getClaims();
    return response;
}
