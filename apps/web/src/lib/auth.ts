import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type { Tables } from './supabase/database.types';
import { supabaseEnv } from './supabase/env';
import { createSupabaseServerClient } from './supabase/server';

export type Profile = Tables<'profiles'>;

export interface CurrentUser {
    id: string;
    email: string | null;
    profile: Profile | null;
}

/** Usuario logueado (o null). Cacheado por request para no repetir la consulta. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
    if (!supabaseEnv()) return null;
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return { id: user.id, email: user.email ?? null, profile };
});

/** Exige sesión: si no hay, redirige al login y vuelve a `nextPath` después. */
export async function requireUser(locale: Locale, nextPath: string): Promise<CurrentUser> {
    const user = await getCurrentUser();
    if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(nextPath)}`);
    return user;
}

export function isProfileComplete(profile: Profile | null): boolean {
    return !!profile && profile.full_name.trim().length >= 2 && profile.skill_level !== null;
}

/** Solo permite redirigir a rutas internas del sitio (evita open redirects). */
export function safeNextPath(next: string | null | undefined, locale: Locale): string {
    if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) return next;
    return `/${locale}/matches`;
}

/** Exige sesión de administrador. Devuelve null si el usuario no es admin (la página muestra el aviso). */
export async function requireAdmin(locale: Locale, nextPath: string): Promise<CurrentUser | null> {
    const user = await requireUser(locale, nextPath);
    return user.profile?.role === 'admin' ? user : null;
}
