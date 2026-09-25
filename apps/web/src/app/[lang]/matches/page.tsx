import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MatchCard from '@/components/MatchCard';
import { buttonStyles, PageHeader, Select } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary, interpolate } from '@/i18n/dictionaries';
import { pluralCategory } from '@/lib/format';
import {
    listAreas,
    listMatches,
    MATCH_FORMATS,
    parseFilters,
    SKILL_LEVELS,
    WHEN_OPTIONS,
} from '@/lib/match-data';
import { supabaseEnv } from '@/lib/supabase/env';

export async function generateMetadata({ params }: PageProps<'/[lang]/matches'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return {
        title: dict.matchList.title,
        description: dict.matchList.subtitle,
        alternates: { canonical: `/${lang}/matches`, languages: { en: '/en/matches', nb: '/nb/matches' } },
    };
}

export default async function MatchesPage({ params, searchParams }: PageProps<'/[lang]/matches'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const dict = await getDictionary(lang);
    const t = dict.matchList;
    const filters = parseFilters(await searchParams);

    const configured = !!supabaseEnv();
    const [matches, areas] = configured ? await Promise.all([listMatches(filters), listAreas()]) : [[], []];
    const hasFilters =
        filters.when !== 'upcoming' ||
        !!filters.area ||
        !!filters.level ||
        !!filters.format ||
        filters.onlyOpen;

    return (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PageHeader title={t.title} subtitle={t.subtitle} />
                <Link href={`/${lang}/matches/new`} className={buttonStyles.primary}>
                    {dict.userMenu.hostMatch}
                </Link>
            </div>

            <form
                method="get"
                className="mt-8 grid gap-4 rounded-2xl bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
            >
                <label className="text-sm font-semibold">
                    {t.when}
                    <Select name="when" defaultValue={filters.when} className="mt-1.5">
                        {WHEN_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {t.whenOptions[option]}
                            </option>
                        ))}
                    </Select>
                </label>
                <label className="text-sm font-semibold">
                    {t.area}
                    <Select name="area" defaultValue={filters.area ?? ''} className="mt-1.5">
                        <option value="">{t.anyArea}</option>
                        {areas.map((area) => (
                            <option key={area} value={area}>
                                {area}
                            </option>
                        ))}
                    </Select>
                </label>
                <label className="text-sm font-semibold">
                    {t.level}
                    <Select name="level" defaultValue={filters.level ?? ''} className="mt-1.5">
                        <option value="">{t.anyLevel}</option>
                        {SKILL_LEVELS.map((level) => (
                            <option key={level} value={level}>
                                {dict.levels[level]}
                            </option>
                        ))}
                    </Select>
                </label>
                <label className="text-sm font-semibold">
                    {t.format}
                    <Select name="format" defaultValue={filters.format ?? ''} className="mt-1.5">
                        <option value="">{t.anyFormat}</option>
                        {MATCH_FORMATS.map((format) => (
                            <option key={format} value={format}>
                                {format}
                            </option>
                        ))}
                    </Select>
                </label>
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            name="open"
                            value="1"
                            defaultChecked={filters.onlyOpen}
                            className="h-4 w-4 accent-primary-strong"
                        />
                        {t.onlyOpen}
                    </label>
                    <button type="submit" className={buttonStyles.primary}>
                        {t.apply}
                    </button>
                </div>
            </form>

            <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-charcoal/70" aria-live="polite">
                    {interpolate(t.count[pluralCategory(matches.length, lang)], { count: matches.length })}
                </p>
                {hasFilters && (
                    <Link href={`/${lang}/matches`} className={`${buttonStyles.link} text-sm`}>
                        {t.reset}
                    </Link>
                )}
            </div>

            {matches.length > 0 ? (
                <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match) => (
                        <li key={match.id}>
                            <MatchCard match={match} locale={lang} dict={dict} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-black/15 px-6 py-12 text-center">
                    <p className="font-medium">{t.empty}</p>
                    <Link href={`/${lang}/matches/new`} className={`${buttonStyles.link} mt-3 inline-block`}>
                        {t.emptyCta}
                    </Link>
                </div>
            )}
        </section>
    );
}
