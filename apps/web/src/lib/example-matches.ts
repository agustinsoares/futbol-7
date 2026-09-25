import type { MatchSummary } from '@/components/MatchCard';

function daysFromNow(days: number, hourOslo: number, minute = 0): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    // Aproximación: Oslo es UTC+1 (invierno) o UTC+2 (verano). Para ejemplos basta con UTC+2.
    date.setUTCHours(hourOslo - 2, minute, 0, 0);
    return date.toISOString();
}

// Datos de ejemplo mientras no hay base de datos conectada.
export function exampleMatches(): MatchSummary[] {
    return [
        {
            id: 'example-1',
            venue: 'Stemmemyren kunstgress',
            area: 'Bergen · Årstad',
            startsAt: daysFromNow(1, 18, 30),
            format: '7v7',
            level: 'intermediate',
            spotsTotal: 14,
            spotsTaken: 12,
            pricePerPlayer: 80,
        },
        {
            id: 'example-2',
            venue: 'Frescohallen',
            area: 'Bergen · Fana',
            startsAt: daysFromNow(2, 20),
            format: '5v5',
            level: 'beginner',
            spotsTotal: 10,
            spotsTaken: 5,
            pricePerPlayer: 100,
        },
        {
            id: 'example-3',
            venue: 'Åsane Arena',
            area: 'Bergen · Åsane',
            startsAt: daysFromNow(3, 19),
            format: '11v11',
            level: 'advanced',
            spotsTotal: 22,
            spotsTaken: 22,
            pricePerPlayer: 60,
        },
    ];
}
