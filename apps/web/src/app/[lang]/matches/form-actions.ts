'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { osloWallTimeToDate } from '@/lib/time';

export type MatchFormErrorKey = keyof Dictionary['matchForm']['errors'];
export type MatchFormField =
    'title' | 'venueId' | 'dateTime' | 'duration' | 'maxPlayers' | 'price' | 'description';

export interface MatchFormState {
    error?: MatchFormErrorKey;
    fieldErrors?: Partial<Record<MatchFormField, MatchFormErrorKey>>;
    /** Lo que envió el usuario: React vacía el formulario tras la acción y así lo recuperamos. */
    values?: Record<string, string>;
}

function withValues(state: MatchFormState, formData: FormData): MatchFormState {
    const values: Record<string, string> = {};
    for (const [key, value] of formData) {
        if (typeof value === 'string' && !key.startsWith('$')) values[key] = value;
    }
    return { ...state, values };
}

const optionalNumber = z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(String(v).replace(',', '.'))),
    z.number().min(0).max(10000).nullable(),
);

const schema = z.object({
    title: z.string().trim().min(3).max(120),
    venueId: z.string().uuid(),
    date: z.string(),
    time: z.string(),
    duration: z.coerce.number().int().min(30).max(240),
    format: z.enum(['5v5', '7v7', '9v9', '11v11']),
    maxPlayers: z.coerce.number().int().min(2).max(30),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    gender: z.enum(['mixed', 'men', 'women']),
    visibility: z.enum(['public', 'private']),
    price: optionalNumber,
    description: z.string().trim().max(2000),
});

const FIELD_ERRORS: Record<string, [MatchFormField, MatchFormErrorKey]> = {
    title: ['title', 'title'],
    venueId: ['venueId', 'venue'],
    duration: ['duration', 'duration'],
    maxPlayers: ['maxPlayers', 'maxPlayers'],
    price: ['price', 'price'],
    description: ['description', 'description'],
    date: ['dateTime', 'dateTime'],
    time: ['dateTime', 'dateTime'],
};

type ParsedMatch = z.infer<typeof schema> & { startsAt: Date };

function parse(formData: FormData): { data?: ParsedMatch; state?: MatchFormState } {
    const parsed = schema.safeParse(Object.fromEntries(formData));
    const fieldErrors: MatchFormState['fieldErrors'] = {};
    if (!parsed.success) {
        for (const issue of parsed.error.issues) {
            const mapped = FIELD_ERRORS[String(issue.path[0])];
            if (mapped) fieldErrors[mapped[0]] = mapped[1];
        }
        if (!Object.keys(fieldErrors).length) return { state: { error: 'generic' } };
        return { state: { fieldErrors } };
    }
    const startsAt = osloWallTimeToDate(parsed.data.date, parsed.data.time);
    if (!startsAt || startsAt.getTime() < Date.now() + 5 * 60_000) {
        return { state: { fieldErrors: { dateTime: 'dateTime' } } };
    }
    return { data: { ...parsed.data, startsAt } };
}

function toRow(data: ParsedMatch) {
    return {
        title: data.title,
        venue_id: data.venueId,
        starts_at: data.startsAt.toISOString(),
        duration_minutes: data.duration,
        format: data.format,
        max_players: data.maxPlayers,
        skill_level: data.level,
        gender: data.gender,
        visibility: data.visibility,
        price_per_player: data.price,
        description: data.description || null,
    };
}

function readLocale(formData: FormData): Locale {
    const lang = String(formData.get('lang') ?? '');
    return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

function revalidateLists(locale: Locale) {
    revalidatePath(`/${locale}/matches`);
    revalidatePath(`/${locale}/my-matches`);
    revalidatePath(`/${locale}`);
}

export async function createMatchAction(_prev: MatchFormState, formData: FormData): Promise<MatchFormState> {
    const locale = readLocale(formData);
    const { data, state } = parse(formData);
    if (!data) return withValues(state!, formData);

    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/login?next=/${locale}/matches/new`);

    const { data: created, error } = await supabase
        .from('matches')
        .insert({ ...toRow(data), host_id: user.id })
        .select('id')
        .single();
    if (error || !created) {
        console.error('createMatch failed', error);
        return withValues({ error: 'generic' }, formData);
    }

    // El host juega su propio partido: ocupa la primera plaza.
    await supabase.rpc('join_match', { p_match_id: created.id });

    revalidateLists(locale);
    redirect(`/${locale}/matches/${created.id}`);
}

export async function updateMatchAction(_prev: MatchFormState, formData: FormData): Promise<MatchFormState> {
    const locale = readLocale(formData);
    const matchId = String(formData.get('matchId') ?? '');
    const { data, state } = parse(formData);
    if (!data) return withValues(state!, formData);

    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/login?next=/${locale}/matches/${matchId}/edit`);

    const { data: updated, error } = await supabase
        .from('matches')
        .update(toRow(data))
        .eq('id', matchId)
        .select('id');
    if (error) {
        // 23514: el trigger impide bajar el cupo por debajo de los confirmados.
        if (error.code === '23514') {
            return withValues({ fieldErrors: { maxPlayers: 'maxBelowConfirmed' } }, formData);
        }
        console.error('updateMatch failed', error);
        return withValues({ error: 'generic' }, formData);
    }
    // Sin filas actualizadas = RLS lo impidió (no eres host ni admin).
    if (!updated?.length) return withValues({ error: 'forbidden' }, formData);

    revalidateLists(locale);
    revalidatePath(`/${locale}/matches/${matchId}`);
    redirect(`/${locale}/matches/${matchId}`);
}
