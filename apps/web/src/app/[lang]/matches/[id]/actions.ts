'use server';

import type { PostgrestError } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
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

// ─── Equipos ──────────────────────────────────────────────────────────────────

export interface SimpleFormState {
    ok?: boolean;
    error?: string;
}

const uuidList = z.array(z.string().uuid()).max(30);

export async function saveTeamsAction(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
    const { locale, matchId } = read(formData);
    const teamA = uuidList.safeParse(formData.getAll('teamA'));
    const teamB = uuidList.safeParse(formData.getAll('teamB'));
    if (!teamA.success || !teamB.success) return { error: 'generic' };

    const supabase = await requireSession(locale, matchId);
    const { error } = await supabase.rpc('save_teams', {
        p_match_id: matchId,
        p_team_a: teamA.data,
        p_team_b: teamB.data,
    });
    if (error) return { error: 'generic' };
    revalidatePath(`/${locale}/matches/${matchId}`);
    return { ok: true };
}

// ─── Resultado y asistencia ───────────────────────────────────────────────────

const score = z.coerce.number().int().min(0).max(99);

export async function recordResultAction(
    _prev: SimpleFormState,
    formData: FormData,
): Promise<SimpleFormState> {
    const { locale, matchId } = read(formData);
    const scoreA = score.safeParse(formData.get('scoreA'));
    const scoreB = score.safeParse(formData.get('scoreB'));
    const attended = uuidList.safeParse(formData.getAll('attended'));
    if (
        !scoreA.success ||
        !scoreB.success ||
        formData.get('scoreA') === '' ||
        formData.get('scoreB') === ''
    ) {
        return { error: 'score' };
    }
    if (!attended.success) return { error: 'generic' };

    const supabase = await requireSession(locale, matchId);
    const { error } = await supabase.rpc('record_result', {
        p_match_id: matchId,
        p_score_a: scoreA.data,
        p_score_b: scoreB.data,
        p_attended: attended.data,
    });
    if (error) return { error: error.code === 'P0001' ? 'notStarted' : 'generic' };
    revalidateMatch(locale, matchId);
    return { ok: true };
}

// ─── Valoraciones ─────────────────────────────────────────────────────────────

export async function rateAction(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
    const { locale, matchId } = read(formData);
    const supabase = await requireSession(locale, matchId);

    const ratings: { rated: string; score: number }[] = [];
    for (const [key, value] of formData) {
        if (!key.startsWith('rating:') || typeof value !== 'string' || !value) continue;
        const rated = z.string().uuid().safeParse(key.slice('rating:'.length));
        const stars = z.coerce.number().int().min(1).max(5).safeParse(value);
        if (rated.success && stars.success) ratings.push({ rated: rated.data, score: stars.data });
    }

    for (const { rated, score: stars } of ratings) {
        const { error } = await supabase.rpc('rate_player', {
            p_match_id: matchId,
            p_rated_id: rated,
            p_score: stars,
        });
        if (error) return { error: 'generic' };
    }
    revalidatePath(`/${locale}/matches/${matchId}`);
    return { ok: true };
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function postMessageAction(
    _prev: SimpleFormState,
    formData: FormData,
): Promise<SimpleFormState> {
    const { locale, matchId } = read(formData);
    const body = z.string().trim().min(1).max(1000).safeParse(formData.get('body'));
    if (!body.success) return {};

    const supabase = await requireSession(locale, matchId);
    const {
        data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
        .from('match_messages')
        .insert({ match_id: matchId, user_id: user!.id, body: body.data });
    if (error) return { error: 'generic' };
    revalidatePath(`/${locale}/matches/${matchId}`);
    return { ok: true };
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
    const { locale, matchId } = read(formData);
    const messageId = z.string().uuid().safeParse(formData.get('messageId'));
    if (!messageId.success) return;
    const supabase = await requireSession(locale, matchId);
    await supabase.from('match_messages').delete().eq('id', messageId.data);
    revalidatePath(`/${locale}/matches/${matchId}`);
}
