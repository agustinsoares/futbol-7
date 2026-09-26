import 'server-only';
import type { MatchSummary } from '@/components/MatchCard';
import { exampleMatches } from './example-matches';
import { toSummary } from './match-data';
import { createSupabasePublicClient } from './supabase/server';

interface UpcomingMatches {
    matches: MatchSummary[];
    /** true si son datos de ejemplo (Supabase sin configurar, con error o sin partidos). */
    isExample: boolean;
}

/** Próximos partidos públicos para la home (cliente anónimo: la página puede ser estática/ISR). */
export async function getUpcomingMatches(limit: number): Promise<UpcomingMatches> {
    const supabase = createSupabasePublicClient();
    if (!supabase) return { matches: exampleMatches(), isExample: true };

    const { data, error } = await supabase
        .from('match_listings')
        .select('*')
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
