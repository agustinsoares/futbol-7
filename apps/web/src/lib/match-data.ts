import 'server-only';
import type { MatchSummary } from '@/components/MatchCard';
import type { Enums, Tables, Views } from './supabase/database.types';
import { createSupabaseServerClient } from './supabase/server';
import { addDays, osloStartOfDay, osloToday, weekday } from './time';

export type SkillLevel = Enums<'skill_level'>;
export type MatchFormat = Enums<'match_format'>;
export type ListingRow = Views<'match_listings'>;

export const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];
export const MATCH_FORMATS: MatchFormat[] = ['5v5', '7v7', '9v9', '11v11'];
export const WHEN_OPTIONS = ['upcoming', 'today', 'week', 'weekend'] as const;
export type WhenOption = (typeof WHEN_OPTIONS)[number];

export interface MatchFilters {
    when: WhenOption;
    area: string | null;
    level: SkillLevel | null;
    format: MatchFormat | null;
    onlyOpen: boolean;
    view: 'list' | 'map';
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export function parseFilters(params: SearchParams): MatchFilters {
    const when = one(params.when);
    const level = one(params.level);
    const format = one(params.format);
    const area = one(params.area)?.trim();
    return {
        when: (WHEN_OPTIONS as readonly string[]).includes(when ?? '') ? (when as WhenOption) : 'upcoming',
        area: area ? area.slice(0, 60) : null,
        level: (SKILL_LEVELS as string[]).includes(level ?? '') ? (level as SkillLevel) : null,
        format: (MATCH_FORMATS as string[]).includes(format ?? '') ? (format as MatchFormat) : null,
        onlyOpen: one(params.open) === '1',
        view: one(params.view) === 'map' ? 'map' : 'list',
    };
}

/** Rango de fechas (UTC) para cada opción de "cuándo", calculado en hora de Bergen. */
export function timeRange(when: WhenOption, now = new Date()): { from: Date; to: Date | null } {
    const today = osloToday(now);
    switch (when) {
        case 'today':
            return { from: now, to: osloStartOfDay(addDays(today, 1)) };
        case 'week':
            return { from: now, to: osloStartOfDay(addDays(today, 7)) };
        case 'weekend': {
            const day = weekday(today); // 0 = domingo, 6 = sábado
            const saturday = day === 0 ? addDays(today, -1) : addDays(today, 6 - day);
            const monday = addDays(saturday, 2);
            const start = osloStartOfDay(saturday);
            return { from: start > now ? start : now, to: osloStartOfDay(monday) };
        }
        default:
            return { from: now, to: null };
    }
}

export function toSummary(row: ListingRow): MatchSummary | null {
    const { id, format, skill_level, starts_at, max_players, venue_name, venue_area } = row;
    if (!id || !format || !skill_level || !starts_at || !max_players || !venue_name || !venue_area)
        return null;
    return {
        id,
        title: row.title ?? undefined,
        venue: venue_name,
        area: `Bergen · ${venue_area}`,
        startsAt: starts_at,
        format,
        level: skill_level,
        spotsTotal: max_players,
        spotsTaken: row.confirmed_count ?? 0,
        pricePerPlayer: row.price_per_player,
        status: row.status ?? undefined,
        venueId: row.venue_id ?? undefined,
        lat: row.venue_lat ?? undefined,
        lng: row.venue_lng ?? undefined,
    };
}

function isSummary(m: MatchSummary | null): m is MatchSummary {
    return m !== null;
}

export async function listMatches(filters: MatchFilters, limit = 60): Promise<MatchSummary[]> {
    const supabase = await createSupabaseServerClient();
    const { from, to } = timeRange(filters.when);

    let query = supabase
        .from('match_listings')
        .select('*')
        .eq('visibility', 'public')
        .in('status', filters.onlyOpen ? ['open'] : ['open', 'full'])
        .gt('starts_at', from.toISOString())
        .order('starts_at', { ascending: true })
        .limit(limit);
    if (to) query = query.lt('starts_at', to.toISOString());
    if (filters.area) query = query.eq('venue_area', filters.area);
    if (filters.level) query = query.eq('skill_level', filters.level);
    if (filters.format) query = query.eq('format', filters.format);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toSummary).filter(isSummary);
}

export type Venue = Tables<'venues'>;

export async function listVenues(): Promise<Venue[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('venues').select('*').order('name');
    if (error) throw error;
    return data ?? [];
}

export async function listAreas(): Promise<string[]> {
    const venues = await listVenues();
    return [...new Set(venues.map((v) => v.area))].sort((a, b) => a.localeCompare(b, 'nb'));
}

export interface Participant {
    userId: string;
    status: Enums<'participant_status'>;
    joinedAt: string;
    name: string;
    level: SkillLevel | null;
    position: Enums<'player_position'> | null;
    team: 'A' | 'B' | null;
    attended: boolean | null;
}

export interface MatchDetail {
    match: Tables<'matches'>;
    venue: Venue;
    hostName: string;
    confirmed: Participant[];
    waitlist: Participant[];
    /** Ya empezó (calculado al cargar los datos, fuera del render). */
    hasStarted: boolean;
}

export async function getMatchDetail(id: string): Promise<MatchDetail | null> {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const supabase = await createSupabaseServerClient();

    const { data: match } = await supabase.from('matches').select('*').eq('id', id).maybeSingle();
    if (!match) return null;

    const [{ data: venue }, { data: host }, { data: rows }] = await Promise.all([
        supabase.from('venues').select('*').eq('id', match.venue_id).single(),
        supabase.from('profiles').select('full_name').eq('id', match.host_id).maybeSingle(),
        supabase
            .from('match_participants')
            .select(
                'user_id, status, joined_at, team, attended, profiles(full_name, skill_level, preferred_position)',
            )
            .eq('match_id', id)
            .in('status', ['confirmed', 'waitlisted'])
            .order('joined_at', { ascending: true }),
    ]);
    if (!venue) return null;

    const participants: Participant[] = (rows ?? []).map((row) => ({
        userId: row.user_id,
        status: row.status,
        joinedAt: row.joined_at,
        name: row.profiles?.full_name || '—',
        level: row.profiles?.skill_level ?? null,
        position: row.profiles?.preferred_position ?? null,
        team: row.team === 'A' || row.team === 'B' ? row.team : null,
        attended: row.attended,
    }));

    return {
        match,
        venue,
        hostName: host?.full_name || '—',
        confirmed: participants.filter((p) => p.status === 'confirmed'),
        waitlist: participants.filter((p) => p.status === 'waitlisted'),
        hasStarted: new Date(match.starts_at).getTime() <= Date.now(),
    };
}

export interface MyMatch {
    summary: MatchSummary;
    role: 'host' | 'confirmed' | 'waitlisted';
}

export async function listMyMatches(userId: string): Promise<{ upcoming: MyMatch[]; past: MyMatch[] }> {
    const supabase = await createSupabaseServerClient();
    const { data: mine } = await supabase
        .from('match_participants')
        .select('match_id, status')
        .eq('user_id', userId)
        .in('status', ['confirmed', 'waitlisted']);
    const { data: hosted } = await supabase.from('matches').select('id').eq('host_id', userId);

    const roles = new Map<string, MyMatch['role']>();
    for (const row of mine ?? []) roles.set(row.match_id, row.status as 'confirmed' | 'waitlisted');
    for (const row of hosted ?? []) roles.set(row.id, 'host');
    if (!roles.size) return { upcoming: [], past: [] };

    const { data } = await supabase
        .from('match_listings')
        .select('*')
        .in('id', [...roles.keys()])
        .order('starts_at', { ascending: true });

    const now = Date.now();
    const all = (data ?? [])
        .map((row) => {
            const summary = toSummary(row);
            return summary ? { summary, role: roles.get(summary.id)! } : null;
        })
        .filter((m): m is MyMatch => m !== null);

    return {
        upcoming: all.filter(
            (m) => new Date(m.summary.startsAt).getTime() > now && m.summary.status !== 'completed',
        ),
        past: all
            .filter((m) => new Date(m.summary.startsAt).getTime() <= now || m.summary.status === 'completed')
            .reverse(),
    };
}

export interface ChatMessage {
    id: string;
    userId: string;
    name: string;
    body: string;
    createdAt: string;
}

/** Mensajes del chat. RLS devuelve vacío si el usuario no es parte del partido. */
export async function listMessages(matchId: string): Promise<ChatMessage[]> {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from('match_messages')
        .select('id, user_id, body, created_at, profiles(full_name)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(200);
    return (data ?? []).map((m) => ({
        id: m.id,
        userId: m.user_id,
        name: m.profiles?.full_name || '—',
        body: m.body,
        createdAt: m.created_at,
    }));
}

/** Valoraciones que el usuario actual ya dio en un partido: { jugador: puntuación }. */
export async function myRatings(matchId: string, userId: string): Promise<Record<string, number>> {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from('player_ratings')
        .select('rated_id, score')
        .eq('match_id', matchId)
        .eq('rater_id', userId);
    return Object.fromEntries((data ?? []).map((r) => [r.rated_id, r.score]));
}

export interface PlayerStats {
    matchesPlayed: number;
    noShows: number;
    attendanceRate: number | null;
    avgRating: number | null;
    ratingsCount: number;
    matchesHosted: number;
}

export async function getPlayer(
    userId: string,
): Promise<{ profile: Tables<'profiles'>; stats: PlayerStats; recent: MatchSummary[] } | null> {
    if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;
    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!profile) return null;

    const [{ data: statsRows }, { data: played }] = await Promise.all([
        supabase.rpc('player_stats', { p_user_id: userId }),
        supabase
            .from('match_participants')
            .select('match_id')
            .eq('user_id', userId)
            .eq('status', 'confirmed'),
    ]);
    const s = statsRows?.[0];
    const ids = (played ?? []).map((r) => r.match_id);
    let recent: MatchSummary[] = [];
    if (ids.length) {
        const { data } = await supabase
            .from('match_listings')
            .select('*')
            .in('id', ids)
            .eq('status', 'completed')
            .order('starts_at', { ascending: false })
            .limit(6);
        recent = (data ?? []).map(toSummary).filter(isSummary);
    }

    return {
        profile,
        stats: {
            matchesPlayed: s?.matches_played ?? 0,
            noShows: s?.no_shows ?? 0,
            attendanceRate: s?.attendance_rate ?? null,
            avgRating: s?.avg_rating ?? null,
            ratingsCount: s?.ratings_count ?? 0,
            matchesHosted: s?.matches_hosted ?? 0,
        },
        recent,
    };
}
