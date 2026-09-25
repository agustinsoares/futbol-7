import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { buildIcs } from '@/lib/ics';
import { getMatchDetail } from '@/lib/match-data';

// Descarga del partido como evento de calendario (.ics), con aviso 2 horas antes.
export async function GET(request: NextRequest, { params }: RouteContext<'/api/matches/[id]/ics'>) {
    const { id } = await params;
    const lang = request.nextUrl.searchParams.get('lang');
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

    const detail = await getMatchDetail(id);
    if (!detail) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { match, venue } = detail;
    const start = new Date(match.starts_at);
    const url = `${request.nextUrl.origin}/${locale}/matches/${match.id}`;
    const ics = buildIcs({
        uid: `${match.id}@aaltofootball`,
        start,
        end: new Date(start.getTime() + match.duration_minutes * 60_000),
        summary: `⚽ ${match.title}`,
        location: `${venue.name}, ${venue.address}`,
        description: [match.description, url].filter(Boolean).join('\n\n'),
        url,
        geo: { lat: venue.lat, lng: venue.lng },
        cancelled: match.status === 'cancelled',
    });

    return new NextResponse(ics, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="aalto-football-${match.id.slice(0, 8)}.ics"`,
            'Cache-Control': 'private, no-store',
        },
    });
}
