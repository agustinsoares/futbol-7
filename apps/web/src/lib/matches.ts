import 'server-only';
import type { MatchSummary } from '@/components/MatchCard';
import { exampleMatches } from './example-matches';
import { createSupabasePublicClient } from './supabase/server';

interface UpcomingMatches {
    matches: MatchSummary[];
    /** true si son datos de ejemplo (Supabase sin configurar o sin partidos). */
    isExample: boolean;
}

export async function getUpcomingMatches(limit: number): Promise<UpcomingMatches> {
    const supabase = createSupabasePublicClient();
    if (!supabase) return { matches: exampleMatches(), isExample: true };

    const { data, error } = await supabase
        .from('match_listings')
        .select(
            'id, title, format, skill_level, starts_at, max_players, price_per_player, venue_name, venue_area, confirmed_count',
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
    if (!data?.length) return { matches: exampleMatches(), isExample: true };

    return {
        isExample: false,
        matches: data.map((row) => ({
            id: row.id,
            venue: row.venue_name,
            area: `Bergen · ${row.venue_area}`,
            startsAt: row.starts_at,
            format: row.format,
            level: row.skill_level,
            spotsTotal: row.max_players,
            spotsTaken: row.confirmed_count,
            pricePerPlayer: row.price_per_player,
        })),
    };
}
