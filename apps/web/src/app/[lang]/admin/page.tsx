import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Alert, buttonStyles, PageHeader } from '@/components/ui';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary, interpolate, type Dictionary } from '@/i18n/dictionaries';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getTraffic, vercelAnalyticsUrl, type TrafficRow } from '@/lib/vercel-analytics';

export async function generateMetadata({ params }: PageProps<'/[lang]/admin'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.adminPanel.title, robots: { index: false } };
}

interface Stats {
    users_total: number;
    users_new_7d: number;
    users_active_30d: number;
    matches_upcoming: number;
    matches_completed: number;
    matches_cancelled: number;
    joins_30d: number;
    messages_30d: number;
    fill_rate: number | null;
    no_show_rate: number | null;
    top_venues: { name: string; matches: number }[];
    weekly: { week: string; users: number; matches: number }[];
}

const numberFormat = (locale: Locale) => new Intl.NumberFormat(locale === 'nb' ? 'nb-NO' : 'en-GB');

function shortDate(iso: string, locale: Locale) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale === 'nb' ? 'nb-NO' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        timeZone: 'Europe/Oslo',
    }).format(date);
}

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
    return (
        <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-sm text-charcoal/60">{label}</p>
            <p className="mt-1 font-display text-3xl">{value}</p>
            {hint && <p className="mt-1 text-sm text-charcoal/60">{hint}</p>}
        </div>
    );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-charcoal/60">{subtitle}</p>}
            <div className="mt-4">{children}</div>
        </div>
    );
}

/** Lista con barras horizontales proporcionales al valor. */
function BarList({
    rows,
    empty,
    format,
}: {
    rows: { label: string; value: number }[];
    empty: string;
    format: (n: number) => string;
}) {
    if (rows.length === 0) return <p className="text-sm text-charcoal/60">{empty}</p>;
    const max = Math.max(...rows.map((r) => r.value), 1);
    return (
        <ul className="space-y-2 text-sm">
            {rows.map((row) => (
                <li key={row.label} className="relative overflow-hidden rounded-md">
                    <div
                        className="absolute inset-y-0 left-0 rounded-md bg-primary-soft"
                        style={{ width: `${(row.value / max) * 100}%` }}
                        aria-hidden="true"
                    />
                    <div className="relative flex justify-between gap-3 px-2 py-1.5">
                        <span className="truncate">{row.label}</span>
                        <span className="font-semibold tabular-nums">{format(row.value)}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Columnas verticales simples (sin librerías) para series cortas. */
function Columns({
    rows,
    label,
}: {
    rows: { label: string; value: number; title: string }[];
    label: string;
}) {
    const max = Math.max(...rows.map((r) => r.value), 1);
    return (
        <figure>
            <div className="flex h-32 items-end gap-1" role="img" aria-label={label}>
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex h-full flex-1 flex-col justify-end"
                        title={row.title}
                    >
                        <div
                            className="min-h-0.5 rounded-t bg-primary"
                            style={{ height: `${(row.value / max) * 100}%` }}
                        />
                    </div>
                ))}
            </div>
            <figcaption className="mt-2 flex justify-between text-xs text-charcoal/60">
                <span>{rows[0]?.label}</span>
                <span>{rows.at(-1)?.label}</span>
            </figcaption>
        </figure>
    );
}

async function TrafficSection({ locale, t }: { locale: Locale; t: Dictionary['adminPanel'] }) {
    const result = await getTraffic(30);
    const fmt = numberFormat(locale);
    const link = (
        <a href={vercelAnalyticsUrl()} target="_blank" rel="noreferrer" className={buttonStyles.secondary}>
            {t.openVercel}
        </a>
    );

    if (result.status !== 'ok') {
        return (
            <div className="space-y-4">
                <Alert tone={result.status === 'error' ? 'error' : 'info'}>
                    {result.status === 'error' ? t.trafficError : t.trafficNotConfigured}
                </Alert>
                {link}
            </div>
        );
    }

    const { traffic } = result;
    const rows = (list: TrafficRow[], fallback = '') =>
        list.map((r) => ({ label: r.key || fallback, value: r.pageviews }));
    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label={t.visitors} value={fmt.format(traffic.visitors)} />
                <StatCard label={t.pageviews} value={fmt.format(traffic.pageviews)} />
            </div>
            {traffic.daily.length > 0 && (
                <Panel title={t.pageviews}>
                    <Columns
                        label={t.pageviews}
                        rows={traffic.daily.map((d) => ({
                            label: shortDate(d.key, locale),
                            value: d.pageviews,
                            title: `${shortDate(d.key, locale)}: ${fmt.format(d.pageviews)}`,
                        }))}
                    />
                </Panel>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title={t.topPages}>
                    <BarList rows={rows(traffic.pages)} empty={t.none} format={fmt.format} />
                </Panel>
                <Panel title={t.referrers}>
                    <BarList rows={rows(traffic.referrers, t.direct)} empty={t.none} format={fmt.format} />
                </Panel>
                <Panel title={t.countries}>
                    <BarList rows={rows(traffic.countries)} empty={t.none} format={fmt.format} />
                </Panel>
                <Panel title={t.devices}>
                    <BarList rows={rows(traffic.devices)} empty={t.none} format={fmt.format} />
                </Panel>
            </div>
            {link}
        </div>
    );
}

export default async function AdminOverviewPage({ params }: PageProps<'/[lang]/admin'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const [admin, dict] = await Promise.all([requireAdmin(lang, `/${lang}/admin`), getDictionary(lang)]);
    const t = dict.adminPanel;
    if (!admin) {
        return (
            <section className="mx-auto max-w-xl px-4 py-16">
                <Alert tone="error">{t.forbidden}</Alert>
            </section>
        );
    }

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.rpc('admin_stats');
    const stats = data as unknown as Stats | null;
    const fmt = numberFormat(lang);
    const pct = (n: number | null) => (n === null ? '–' : `${n} %`);

    return (
        <section className="mx-auto max-w-6xl px-4 py-12">
            <PageHeader title={t.title} />

            <h2 className="mt-10 text-2xl">{t.community}</h2>
            {stats ? (
                <>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label={t.players}
                            value={fmt.format(stats.users_total)}
                            hint={interpolate(t.newThisWeek, { count: stats.users_new_7d })}
                        />
                        <StatCard label={t.active30d} value={fmt.format(stats.users_active_30d)} />
                        <StatCard label={t.upcoming} value={fmt.format(stats.matches_upcoming)} />
                        <StatCard
                            label={t.played}
                            value={fmt.format(stats.matches_completed)}
                            hint={interpolate(t.cancelled, { count: stats.matches_cancelled })}
                        />
                        <StatCard label={t.joins30d} value={fmt.format(stats.joins_30d)} />
                        <StatCard label={t.fillRate} value={pct(stats.fill_rate)} hint={t.fillRateHint} />
                        <StatCard label={t.noShowRate} value={pct(stats.no_show_rate)} />
                        <StatCard label={t.messages30d} value={fmt.format(stats.messages_30d)} />
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <Panel title={t.newPlayers} subtitle={t.weekly}>
                            <Columns
                                label={`${t.newPlayers}, ${t.weekly}`}
                                rows={stats.weekly.map((w) => ({
                                    label: shortDate(w.week, lang),
                                    value: w.users,
                                    title: `${interpolate(t.weekOf, { date: shortDate(w.week, lang) })}: ${w.users}`,
                                }))}
                            />
                        </Panel>
                        <Panel title={t.matches} subtitle={t.weekly}>
                            <Columns
                                label={`${t.matches}, ${t.weekly}`}
                                rows={stats.weekly.map((w) => ({
                                    label: shortDate(w.week, lang),
                                    value: w.matches,
                                    title: `${interpolate(t.weekOf, { date: shortDate(w.week, lang) })}: ${w.matches}`,
                                }))}
                            />
                        </Panel>
                        <Panel title={t.topPitches}>
                            <BarList
                                rows={stats.top_venues.map((v) => ({ label: v.name, value: v.matches }))}
                                empty={t.none}
                                format={fmt.format}
                            />
                        </Panel>
                    </div>
                </>
            ) : (
                <div className="mt-4">
                    <Alert tone="error">{t.statsError}</Alert>
                </div>
            )}

            <h2 className="mt-12 text-2xl">{t.traffic}</h2>
            <p className="mt-1 text-charcoal/70">{t.trafficSubtitle}</p>
            <div className="mt-4">
                <TrafficSection locale={lang} t={t} />
            </div>
        </section>
    );
}
