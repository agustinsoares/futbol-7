import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MatchCard from '@/components/MatchCard';
import { INTL_LOCALE, isLocale } from '@/i18n/config';
import { getDictionary, interpolate } from '@/i18n/dictionaries';
import { pluralCategory } from '@/lib/format';
import { getPlayer } from '@/lib/match-data';
import { TIME_ZONE } from '@/lib/site';

export async function generateMetadata({ params }: PageProps<'/[lang]/players/[id]'>): Promise<Metadata> {
    const { lang, id } = await params;
    if (!isLocale(lang)) return {};
    const player = await getPlayer(id);
    return player ? { title: player.profile.full_name, robots: { index: false } } : {};
}

export default async function PlayerPage({ params }: PageProps<'/[lang]/players/[id]'>) {
    const { lang, id } = await params;
    if (!isLocale(lang)) notFound();
    const [player, dict] = await Promise.all([getPlayer(id), getDictionary(lang)]);
    if (!player) notFound();

    const t = dict.player;
    const { profile, stats, recent } = player;
    const memberSince = new Intl.DateTimeFormat(INTL_LOCALE[lang], {
        timeZone: TIME_ZONE,
        month: 'long',
        year: 'numeric',
    }).format(new Date(profile.created_at));
    const initials = profile.full_name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const tiles = [
        { label: t.matchesPlayed, value: String(stats.matchesPlayed) },
        { label: t.matchesHosted, value: String(stats.matchesHosted) },
        {
            label: t.attendance,
            value: stats.attendanceRate !== null ? `${stats.attendanceRate} %` : t.noData,
            note: stats.noShows > 0 ? `${stats.noShows} ${t.noShows.toLowerCase()}` : undefined,
        },
        {
            label: t.rating,
            value: stats.avgRating !== null ? `${stats.avgRating.toFixed(1)} ★` : t.noData,
            note:
                stats.ratingsCount > 0
                    ? interpolate(t.ratingsCount[pluralCategory(stats.ratingsCount, lang)], {
                          count: stats.ratingsCount,
                      })
                    : undefined,
        },
    ];

    return (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <header className="flex items-center gap-5">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                    {initials || '?'}
                </span>
                <div>
                    <h1 className="text-3xl sm:text-4xl">{profile.full_name}</h1>
                    <p className="mt-1 text-charcoal/70">
                        {[
                            profile.skill_level && dict.levels[profile.skill_level],
                            profile.preferred_position && dict.profile.positions[profile.preferred_position],
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                    <p className="text-sm text-charcoal/60">
                        {interpolate(t.memberSince, { date: memberSince })}
                    </p>
                </div>
            </header>

            <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {tiles.map((tile) => (
                    <div key={tile.label} className="rounded-2xl bg-surface p-5">
                        <dt className="text-sm text-charcoal/60">{tile.label}</dt>
                        <dd className="mt-1 text-2xl font-bold">{tile.value}</dd>
                        {tile.note && <dd className="text-sm text-charcoal/60">{tile.note}</dd>}
                    </div>
                ))}
            </dl>

            <h2 className="mt-10 text-xl font-bold">{t.recent}</h2>
            {recent.length ? (
                <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {recent.map((match) => (
                        <li key={match.id}>
                            <MatchCard match={match} locale={lang} dict={dict} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-charcoal/70">{t.noRecent}</p>
            )}
        </section>
    );
}
