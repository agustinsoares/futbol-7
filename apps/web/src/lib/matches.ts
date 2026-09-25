import 'server-only';
import type { MatchSummary } from '@/components/MatchCard';
import { exampleMatches } from './example-matches';
import type { Views } from './supabase/database.types';
import { createSupabasePublicClient } from './supabase/server';

interface UpcomingMatches {
    matches: MatchSummary[];
    /** true si son datos de ejemplo (Supabase sin configurar, con error o sin partidos). */
    isExample: boolean;
}

type ListingRow = Pick<
    Views<'match_listings'>,
    | 'id'
    | 'format'
    | 'skill_level'
    | 'starts_at'
    | 'max_players'
    | 'price_per_player'
    | 'venue_name'
    | 'venue_area'
    | 'confirmed_count'
>;

// Las columnas de una vista salen como opcionales en los tipos generados; descartamos filas incompletas.
function toSummary(row: ListingRow): MatchSummary | null {
    const { id, format, skill_level, starts_at, max_players, venue_name, venue_area } = row;
    if (!id || !format || !skill_level || !starts_at || !max_players || !venue_name || !venue_area)
        return null;
    return {
        id,
        venue: venue_name,
        area: `Bergen · ${venue_area}`,
        startsAt: starts_at,
        format,
        level: skill_level,
        spotsTotal: max_players,
        spotsTaken: row.confirmed_count ?? 0,
        pricePerPlayer: row.price_per_player,
    };
}

export async function getUpcomingMatches(limit: number): Promise<UpcomingMatches> {
    const supabase = createSupabasePublicClient();
    if (!supabase) return { matches: exampleMatches(), isExample: true };

    const { data, error } = await supabase
        .from('match_listings')
        .select(
            'id, format, skill_level, starts_at, max_players, price_per_player, venue_name, venue_area, confirmed_count',
        )
        .eq('visibility', 'public')
        .in('status', ['open', 'full'])
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error loading upcoming matches', error);
        return { matches: exampleMatches(), isExample: true };
    }

    const matches = (data ?? []).map(toSummary).filter((m): m is MatchSummary => m !== null);
    if (!matches.length) return { matches: exampleMatches(), isExample: true };
    return { matches, isExample: false };
}
