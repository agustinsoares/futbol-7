import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Alert, PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { requireUser } from '@/lib/auth';
import { getMatchDetail, listVenues } from '@/lib/match-data';
import { dateToOsloInputs, osloToday } from '@/lib/time';
import MatchForm from '../../MatchForm';

export async function generateMetadata({
    params,
}: PageProps<'/[lang]/matches/[id]/edit'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.matchForm.editTitle, robots: { index: false } };
}

export default async function EditMatchPage({ params }: PageProps<'/[lang]/matches/[id]/edit'>) {
    const { lang, id } = await params;
    if (!isLocale(lang)) notFound();
    const user = await requireUser(lang, `/${lang}/matches/${id}/edit`);
    const [dict, detail, venues] = await Promise.all([getDictionary(lang), getMatchDetail(id), listVenues()]);
    if (!detail) notFound();

    const { match } = detail;
    const canManage = user.id === match.host_id || user.profile?.role === 'admin';
    const editable = match.status !== 'cancelled' && match.status !== 'completed' && !detail.hasStarted;
    const { date, time } = dateToOsloInputs(match.starts_at);

    return (
        <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <PageHeader title={dict.matchForm.editTitle} subtitle={match.title} />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                {!canManage ? (
                    <Alert tone="error">{dict.matchForm.errors.forbidden}</Alert>
                ) : !editable ? (
                    <Alert tone="info">
                        {match.status === 'cancelled' ? dict.match.cancelledNotice : dict.match.startedNotice}
                    </Alert>
                ) : (
                    <MatchForm
                        locale={lang}
                        venues={venues}
                        minDate={osloToday()}
                        matchId={match.id}
                        cancelHref={`/${lang}/matches/${match.id}`}
                        dict={dict}
                        initial={{
                            title: match.title,
                            venueId: match.venue_id,
                            date,
                            time,
                            duration: match.duration_minutes,
                            format: match.format,
                            maxPlayers: match.max_players,
                            level: match.skill_level,
                            gender: match.gender,
                            visibility: match.visibility,
                            price: match.price_per_player != null ? String(match.price_per_player) : '',
                            description: match.description ?? '',
                        }}
                    />
                )}
            </div>
        </section>
    );
}
