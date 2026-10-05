import 'server-only';

// Lectura de Vercel Web Analytics con su API REST (https://vercel.com/docs/analytics/web-analytics-api).
// Necesita VERCEL_ANALYTICS_TOKEN (token de vercel.com/account/tokens), VERCEL_ANALYTICS_PROJECT_ID y,
// si el proyecto está en un equipo, VERCEL_ANALYTICS_TEAM_ID. Sin token, el panel enlaza al dashboard.

const API = 'https://api.vercel.com/v1/query/web-analytics/visits';
const CACHE_SECONDS = 600;

export interface TrafficRow {
    key: string;
    pageviews: number;
    visitors: number;
}

export interface Traffic {
    pageviews: number;
    visitors: number;
    daily: TrafficRow[];
    pages: TrafficRow[];
    countries: TrafficRow[];
    referrers: TrafficRow[];
    devices: TrafficRow[];
}

export type TrafficResult =
    { status: 'ok'; traffic: Traffic } | { status: 'not_configured' } | { status: 'error' };

function config() {
    const token = process.env.VERCEL_ANALYTICS_TOKEN;
    const projectId = process.env.VERCEL_ANALYTICS_PROJECT_ID;
    if (!token || !projectId) return null;
    return { token, projectId, teamId: process.env.VERCEL_ANALYTICS_TEAM_ID };
}

/** Enlace al informe completo en el dashboard de Vercel. */
export function vercelAnalyticsUrl(): string {
    return (
        process.env.VERCEL_ANALYTICS_DASHBOARD_URL ?? 'https://vercel.com/a-soares/alto-football/analytics'
    );
}

async function query(
    cfg: NonNullable<ReturnType<typeof config>>,
    endpoint: 'count' | 'aggregate',
    params: Record<string, string | string[]>,
): Promise<unknown> {
    const search = new URLSearchParams({ projectId: cfg.projectId });
    if (cfg.teamId) search.set('teamId', cfg.teamId);
    for (const [key, value] of Object.entries(params)) {
        for (const v of Array.isArray(value) ? value : [value]) search.append(key, v);
    }
    const response = await fetch(`${API}/${endpoint}?${search}`, {
        headers: { Authorization: `Bearer ${cfg.token}` },
        next: { revalidate: CACHE_SECONDS },
    });
    if (!response.ok) throw new Error(`Vercel Analytics ${response.status}`);
    return ((await response.json()) as { data?: unknown }).data;
}

/** Convierte una fila de la API (la dimensión viene como propiedad con su nombre) en TrafficRow. */
export function toRow(raw: unknown, dimension: string): TrafficRow {
    const row = (raw ?? {}) as Record<string, unknown>;
    const key = row[dimension] ?? row.key ?? row.timestamp ?? row.date ?? '';
    const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
    return {
        key: String(key ?? ''),
        pageviews: num(row.pageviews ?? row.count),
        visitors: num(row.visitors),
    };
}

export async function getTraffic(days = 30): Promise<TrafficResult> {
    const cfg = config();
    if (!cfg) return { status: 'not_configured' };

    const until = new Date();
    const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
    const range = { since: since.toISOString(), until: until.toISOString() };
    const aggregate = async (dimension: string, limit: number) => {
        const data = await query(cfg, 'aggregate', { ...range, by: dimension, limit: String(limit) });
        return (Array.isArray(data) ? data : []).map((row) => toRow(row, dimension));
    };

    try {
        const [total, daily, pages, countries, referrers, devices] = await Promise.all([
            query(cfg, 'count', range),
            aggregate('day', days + 1),
            aggregate('requestPath', 8),
            aggregate('country', 6),
            aggregate('referrerHostname', 6),
            aggregate('deviceType', 4),
        ]);
        const totals = toRow(total, '');
        return {
            status: 'ok',
            traffic: {
                pageviews: totals.pageviews,
                visitors: totals.visitors,
                daily: daily.sort((a, b) => a.key.localeCompare(b.key)),
                pages,
                countries,
                referrers,
                devices,
            },
        };
    } catch (error) {
        console.error('Vercel Analytics query failed', error);
        return { status: 'error' };
    }
}
