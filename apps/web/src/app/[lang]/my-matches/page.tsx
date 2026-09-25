import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MatchCard from '@/components/MatchCard';
import { buttonStyles, PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { requireUser } from '@/lib/auth';
import { listMyMatches, type MyMatch } from '@/lib/match-data';

export async function generateMetadata({ params }: PageProps<'/[lang]/my-matches'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.myMatches.title, robots: { index: false } };
}

export default async function MyMatchesPage({ params }: PageProps<'/[lang]/my-matches'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const user = await requireUser(lang, `/${lang}/my-matches`);
    const [dict, { upcoming, past }] = await Promise.all([getDictionary(lang), listMyMatches(user.id)]);
    const t = dict.myMatches;

    const badge = (role: MyMatch['role']) =>
        role === 'host' ? t.statusHost : role === 'waitlisted' ? t.statusWaitlisted : t.statusConfirmed;

    const hosting = upcoming.filter((m) => m.role === 'host');
    const playing = upcoming.filter((m) => m.role !== 'host');

    const sections: { title: string; items: MyMatch[]; empty: string }[] = [
        { title: t.upcoming, items: playing, empty: t.empty },
        { title: t.hosting, items: hosting, empty: t.emptyHosting },
        { title: t.past, items: past.slice(0, 12), empty: t.emptyPast },
    ];

    return (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PageHeader title={t.title} />
                <Link href={`/${lang}/matches`} className={buttonStyles.secondary}>
                    {t.browse}
                </Link>
            </div>
            {sections.map((section) => (
                <div key={section.title} className="mt-10">
                    <h2 className="text-xl font-bold">{section.title}</h2>
                    {section.items.length ? (
                        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {section.items.map((item) => (
                                <li key={item.summary.id}>
                                    <MatchCard
                                        match={item.summary}
                                        locale={lang}
                                        dict={dict}
                                        badge={badge(item.role)}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-charcoal/70">{section.empty}</p>
                    )}
                </div>
            ))}
        </section>
    );
}
