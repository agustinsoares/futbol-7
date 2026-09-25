'use server';

import type { PostgrestError } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type JoinErrorKey = keyof Dictionary['match']['errors'];

export interface JoinFormState {
    error?: JoinErrorKey;
}

function read(formData: FormData): { locale: Locale; matchId: string } {
    const lang = String(formData.get('lang') ?? '');
    return {
        locale: isLocale(lang) ? lang : DEFAULT_LOCALE,
        matchId: String(formData.get('matchId') ?? ''),
    };
}

function mapError(error: PostgrestError): JoinErrorKey {
    switch (error.code) {
        case '28000':
            return 'notSignedIn';
        case 'P0002':
            return 'notFound';
        case 'P0001':
            return 'closed';
        default:
            return 'generic';
    }
}

function revalidateMatch(locale: Locale, matchId: string) {
    revalidatePath(`/${locale}/matches/${matchId}`);
    revalidatePath(`/${locale}/matches`);
    revalidatePath(`/${locale}/my-matches`);
    revalidatePath(`/${locale}`);
}

async function requireSession(locale: Locale, matchId: string) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/matches/${matchId}`)}`);
    return supabase;
}

export async function joinMatchAction(_prev: JoinFormState, formData: FormData): Promise<JoinFormState> {
    const { locale, matchId } = read(formData);
    const supabase = await requireSession(locale, matchId);
    const { error } = await supabase.rpc('join_match', { p_match_id: matchId });
    if (error) return { error: mapError(error) };
    revalidateMatch(locale, matchId);
    return {};
}

export async function leaveMatchAction(_prev: JoinFormState, formData: FormData): Promise<JoinFormState> {
    const { locale, matchId } = read(formData);
    const supabase = await requireSession(locale, matchId);
    const { error } = await supabase.rpc('leave_match', { p_match_id: matchId });
    if (error) return { error: mapError(error) };
    revalidateMatch(locale, matchId);
    return {};
}

export async function cancelMatchAction(formData: FormData): Promise<void> {
    const { locale, matchId } = read(formData);
    const supabase = await requireSession(locale, matchId);
    // RLS: solo el host o un admin pueden actualizar el partido.
    await supabase.from('matches').update({ status: 'cancelled' }).eq('id', matchId);
    revalidateMatch(locale, matchId);
    redirect(`/${locale}/matches/${matchId}`);
}
