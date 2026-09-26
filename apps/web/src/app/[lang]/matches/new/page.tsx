import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { isProfileComplete, requireUser } from '@/lib/auth';
import { listVenues } from '@/lib/match-data';
import { addDays, osloToday } from '@/lib/time';
import MatchForm from '../MatchForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/matches/new'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.matchForm.newTitle, robots: { index: false } };
}

export default async function NewMatchPage({ params }: PageProps<'/[lang]/matches/new'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const path = `/${lang}/matches/new`;
    const user = await requireUser(lang, path);
    if (!isProfileComplete(user.profile)) {
        redirect(`/${lang}/profile?welcome=1&next=${encodeURIComponent(path)}`);
    }

    const [dict, venues] = await Promise.all([getDictionary(lang), listVenues()]);
    const today = osloToday();

    return (
        <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <PageHeader title={dict.matchForm.newTitle} subtitle={dict.matchForm.newSubtitle} />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <MatchForm
                    locale={lang}
                    venues={venues}
                    minDate={today}
                    cancelHref={`/${lang}/matches`}
                    dict={dict}
                    initial={{
                        title: '',
                        venueId: '',
                        date: addDays(today, 1),
                        time: '18:00',
                        duration: 60,
                        format: '7v7',
                        maxPlayers: 14,
                        level: user.profile?.skill_level ?? 'intermediate',
                        gender: 'mixed',
                        visibility: 'public',
                        price: '',
                        description: '',
                    }}
                />
            </div>
        </section>
    );
}
