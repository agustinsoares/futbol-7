import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert, buttonStyles, PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary, interpolate } from '@/i18n/dictionaries';
import { requireAdmin } from '@/lib/auth';
import { pluralCategory } from '@/lib/format';
import { listVenues } from '@/lib/match-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: PageProps<'/[lang]/admin/venues'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.admin.title, robots: { index: false } };
}

export default async function AdminVenuesPage({ params }: PageProps<'/[lang]/admin/venues'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const [admin, dict] = await Promise.all([
        requireAdmin(lang, `/${lang}/admin/venues`),
        getDictionary(lang),
    ]);
    const t = dict.admin;

    if (!admin) {
        return (
            <section className="mx-auto max-w-xl px-4 py-16">
                <Alert tone="error">{t.forbidden}</Alert>
            </section>
        );
    }

    const venues = await listVenues();
    const supabase = await createSupabaseServerClient();
    const { data: matchRows } = await supabase.from('matches').select('venue_id');
    const counts = new Map<string, number>();
    for (const row of matchRows ?? []) counts.set(row.venue_id, (counts.get(row.venue_id) ?? 0) + 1);

    return (
        <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PageHeader title={t.title} subtitle={t.subtitle} />
                <Link href={`/${lang}/admin/venues/new`} className={buttonStyles.primary}>
                    {t.add}
                </Link>
            </div>
            <ul className="mt-8 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
                {venues.map((venue) => {
                    const count = counts.get(venue.id) ?? 0;
                    return (
                        <li
                            key={venue.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                        >
                            <div>
                                <p className="font-semibold">{venue.name}</p>
                                <p className="text-sm text-charcoal/60">
                                    {venue.area} · {dict.match.surfaces[venue.surface]} ·{' '}
                                    {interpolate(t.matches[pluralCategory(count, lang)], { count })}
                                </p>
                            </div>
                            <Link href={`/${lang}/admin/venues/${venue.id}`} className={buttonStyles.link}>
                                {t.edit}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
