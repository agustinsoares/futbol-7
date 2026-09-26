import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Alert, buttonStyles } from '@/components/ui';
import { INTL_LOCALE, isLocale, type Locale } from '@/i18n/config';
import { getDictionary, interpolate, type Dictionary } from '@/i18n/dictionaries';
import { getCurrentUser } from '@/lib/auth';
import { formatMatchDate, formatMatchDateRange, formatPrice, pluralCategory } from '@/lib/format';
import {
    getMatchDetail,
    listMessages,
    myRatings,
    type ChatMessage,
    type Participant,
} from '@/lib/match-data';
import { requestOrigin } from '@/lib/request-origin';
import { TIME_ZONE } from '@/lib/site';
import CancelMatchButton from './CancelMatchButton';
import ChatPanel from './ChatPanel';
import JoinLeaveForm from './JoinLeaveForm';
import RatingsForm from './RatingsForm';
import ResultForm from './ResultForm';
import ShareButtons from './ShareButtons';
import TeamsEditor from './TeamsEditor';

export async function generateMetadata({ params }: PageProps<'/[lang]/matches/[id]'>): Promise<Metadata> {
    const { lang, id } = await params;
    if (!isLocale(lang)) return {};
    const detail = await getMatchDetail(id);
    if (!detail) return {};
    const { match, venue, confirmed } = detail;
    const dict = await getDictionary(lang);
    const spotsLeft = Math.max(match.max_players - confirmed.length, 0);
    const description = `${formatMatchDate(match.starts_at, lang)} · ${venue.name} · ${
        spotsLeft > 0
            ? interpolate(dict.matchCard.spotsLeft[pluralCategory(spotsLeft, lang)], { count: spotsLeft })
            : dict.matchCard.full
    }`;
    return {
        title: match.title,
        description,
        openGraph: { title: match.title, description },
        robots: match.visibility === 'private' ? { index: false } : undefined,
        alternates: { languages: { en: `/en/matches/${id}`, nb: `/nb/matches/${id}` } },
    };
}

function ParticipantList({
    people,
    hostId,
    locale,
    dict,
}: {
    people: Participant[];
    hostId: string;
    locale: Locale;
    dict: Dictionary;
}) {
    return (
        <ol className="divide-y divide-black/5">
            {people.map((person, index) => (
                <li key={person.userId} className="flex items-center gap-3 py-2.5">
                    <span className="w-6 text-right text-sm text-charcoal/50 tabular-nums">{index + 1}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-strong">
                        {person.name
                            .split(/\s+/)
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                            <Link
                                href={`/${locale}/players/${person.userId}`}
                                className="hover:text-primary-strong"
                            >
                                {person.name}
                            </Link>
                            {person.userId === hostId && (
                                <span className="ml-2 rounded bg-charcoal px-1.5 py-0.5 text-xs font-semibold text-white">
                                    {dict.match.hostBadge}
                                </span>
                            )}
                        </span>
                        <span className="block text-sm text-charcoal/60">
                            {[
                                person.level && dict.levels[person.level],
                                person.position && dict.profile.positions[person.position],
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                    </span>
                </li>
            ))}
            {people.length === 0 && <li className="py-3 text-sm text-charcoal/60">{dict.match.noPlayers}</li>}
        </ol>
    );
}

export default async function MatchPage({ params }: PageProps<'/[lang]/matches/[id]'>) {
    const { lang, id } = await params;
    if (!isLocale(lang)) notFound();
    const [detail, user, dict, origin] = await Promise.all([
        getMatchDetail(id),
        getCurrentUser(),
        getDictionary(lang),
        requestOrigin(),
    ]);
    if (!detail) notFound();

    const t = dict.match;
    const { match, venue, confirmed, waitlist, hostName, hasStarted: started } = detail;
    const spotsLeft = Math.max(match.max_players - confirmed.length, 0);
    const closed = match.status === 'cancelled' || match.status === 'completed' || started;
    const myConfirmed = user ? confirmed.some((p) => p.userId === user.id) : false;
    const myWaitlistIndex = user ? waitlist.findIndex((p) => p.userId === user.id) : -1;
    const isHost = user?.id === match.host_id;
    const canManage = isHost || user?.profile?.role === 'admin';
    const isMember = !!user && (canManage || myConfirmed || myWaitlistIndex >= 0);
    const completed = match.status === 'completed';
    const [messages, given] = await Promise.all([
        isMember ? listMessages(match.id) : Promise.resolve([] as ChatMessage[]),
        completed && myConfirmed && user ? myRatings(match.id, user.id) : Promise.resolve({}),
    ]);
    const timeFormat = new Intl.DateTimeFormat(INTL_LOCALE[lang], {
        timeZone: TIME_ZONE,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
    const timeLabels = Object.fromEntries(
        messages.map((m) => [m.id, timeFormat.format(new Date(m.createdAt))]),
    );
    const teamA = confirmed.filter((p) => p.team === 'A');
    const teamB = confirmed.filter((p) => p.team === 'B');
    const hasTeams = teamA.length + teamB.length > 0;
    const hasScore = match.score_a !== null && match.score_b !== null;
    const url = `${origin}/${lang}/matches/${match.id}`;
    const shortDate = formatMatchDate(match.starts_at, lang);

    const mapDelta = { lat: 0.004, lng: 0.009 };
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${venue.lng - mapDelta.lng}%2C${
        venue.lat - mapDelta.lat
    }%2C${venue.lng + mapDelta.lng}%2C${venue.lat + mapDelta.lat}&layer=mapnik&marker=${venue.lat}%2C${venue.lng}`;
    const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`;

    let joinBlock: ReactNode;
    if (match.status === 'cancelled') joinBlock = <Alert tone="error">{t.cancelledNotice}</Alert>;
    else if (match.status === 'completed') joinBlock = <Alert tone="info">{t.completedNotice}</Alert>;
    else if (started) joinBlock = <Alert tone="info">{t.startedNotice}</Alert>;
    else if (!user)
        joinBlock = (
            <Link
                href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/matches/${match.id}`)}`}
                className={`${buttonStyles.primary} w-full`}
            >
                {t.signInToJoin}
            </Link>
        );
    else if (myConfirmed)
        joinBlock = (
            <div className="space-y-3">
                <Alert tone="success">{t.youAreIn}</Alert>
                {!isHost && <JoinLeaveForm locale={lang} matchId={match.id} mode="leave" dict={t} />}
            </div>
        );
    else if (myWaitlistIndex >= 0)
        joinBlock = (
            <div className="space-y-3">
                <Alert tone="info">
                    {interpolate(t.youAreWaitlisted, { position: myWaitlistIndex + 1 })}
                </Alert>
                <JoinLeaveForm locale={lang} matchId={match.id} mode="leaveWaitlist" dict={t} />
            </div>
        );
    else
        joinBlock = (
            <JoinLeaveForm
                locale={lang}
                matchId={match.id}
                mode={spotsLeft > 0 ? 'join' : 'joinWaitlist'}
                dict={t}
            />
        );

    const facts: { label: string; value: string }[] = [
        {
            label: t.format,
            value: `${match.format} · ${interpolate(t.duration, { minutes: match.duration_minutes })}`,
        },
        { label: t.level, value: dict.levels[match.skill_level] },
        { label: t.players, value: t.genders[match.gender] },
        {
            label: t.price,
            value: match.price_per_player != null ? formatPrice(match.price_per_player, lang) : t.free,
        },
    ];

    return (
        <article className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
            <Link href={`/${lang}/matches`} className={`${buttonStyles.link} text-sm`}>
                ← {t.back}
            </Link>

            <header className="mt-4">
                <p className="text-sm font-semibold text-primary-strong capitalize">
                    <time dateTime={match.starts_at}>
                        {formatMatchDateRange(match.starts_at, match.duration_minutes, lang)}
                    </time>
                </p>
                <h1 className="mt-2 text-3xl sm:text-4xl">{match.title}</h1>
                <p className="mt-2 text-charcoal/70">
                    {interpolate(t.hostedBy, { name: hostName })} · {venue.name}, {venue.area}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {match.visibility === 'private' && (
                        <p className="rounded-full bg-surface px-3 py-1 text-sm font-medium">
                            {t.privateBadge}
                        </p>
                    )}
                    {match.series_id && (
                        <p className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-strong">
                            {dict.recurring.series}
                        </p>
                    )}
                </div>
            </header>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
                <div className="space-y-8">
                    <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-surface p-5 sm:grid-cols-4">
                        {facts.map((fact) => (
                            <div key={fact.label}>
                                <dt className="text-sm text-charcoal/60">{fact.label}</dt>
                                <dd className="font-semibold">{fact.value}</dd>
                            </div>
                        ))}
                    </dl>

                    {match.description && (
                        <p className="whitespace-pre-line text-charcoal/85">{match.description}</p>
                    )}
                    {match.price_per_player != null && (
                        <p className="text-sm text-charcoal/70">{t.payAtPitch}</p>
                    )}

                    <section aria-labelledby="players-title">
                        <h2 id="players-title" className="text-xl font-bold">
                            {t.playersTitle}{' '}
                            <span className="font-medium text-charcoal/60">
                                {confirmed.length}/{match.max_players}
                            </span>
                        </h2>
                        <div className="mt-3">
                            <ParticipantList
                                people={confirmed}
                                hostId={match.host_id}
                                locale={lang}
                                dict={dict}
                            />
                        </div>
                    </section>

                    {waitlist.length > 0 && (
                        <section aria-labelledby="waitlist-title">
                            <h2 id="waitlist-title" className="text-xl font-bold">
                                {t.waitlistTitle}{' '}
                                <span className="font-medium text-charcoal/60">{waitlist.length}</span>
                            </h2>
                            <div className="mt-3">
                                <ParticipantList
                                    people={waitlist}
                                    hostId={match.host_id}
                                    locale={lang}
                                    dict={dict}
                                />
                            </div>
                        </section>
                    )}

                    {hasScore && (
                        <section
                            aria-labelledby="result-title"
                            className="rounded-2xl bg-charcoal p-5 text-white"
                        >
                            <h2
                                id="result-title"
                                className="text-sm font-semibold tracking-wide text-white/70 uppercase"
                            >
                                {dict.result.title}
                            </h2>
                            <p className="mt-2 flex items-center justify-center gap-4 font-display text-3xl">
                                <span className="font-sans text-base font-semibold">{dict.teams.teamA}</span>
                                {match.score_a} – {match.score_b}
                                <span className="font-sans text-base font-semibold">{dict.teams.teamB}</span>
                            </p>
                        </section>
                    )}

                    {(hasTeams || (canManage && !closed && confirmed.length >= 2)) && (
                        <section aria-labelledby="teams-title">
                            <h2 id="teams-title" className="text-xl font-bold">
                                {dict.teams.title}
                            </h2>
                            <div className="mt-3">
                                {canManage && !closed ? (
                                    <TeamsEditor
                                        locale={lang}
                                        matchId={match.id}
                                        dict={dict.teams}
                                        players={confirmed.map((p) => ({
                                            id: p.userId,
                                            name: p.name,
                                            level: p.level,
                                            position: p.position,
                                            team: p.team,
                                        }))}
                                    />
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {[
                                            { label: dict.teams.teamA, people: teamA },
                                            { label: dict.teams.teamB, people: teamB },
                                        ].map((team) => (
                                            <div key={team.label} className="rounded-xl bg-surface p-4">
                                                <p className="font-semibold">{team.label}</p>
                                                <ul className="mt-2 space-y-1 text-sm">
                                                    {team.people.map((p) => (
                                                        <li key={p.userId}>{p.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {canManage && started && match.status !== 'cancelled' && confirmed.length > 0 && (
                        <section
                            aria-labelledby="record-title"
                            className="rounded-2xl border border-black/10 p-5"
                        >
                            <h2 id="record-title" className="text-xl font-bold">
                                {hasScore ? dict.result.edit : dict.result.recordTitle}
                            </h2>
                            <div className="mt-3">
                                <ResultForm
                                    locale={lang}
                                    matchId={match.id}
                                    dict={dict}
                                    initialScore={{ a: match.score_a, b: match.score_b }}
                                    players={confirmed.map((p) => ({
                                        id: p.userId,
                                        name: p.name,
                                        attended: p.attended,
                                    }))}
                                />
                            </div>
                        </section>
                    )}

                    {completed && myConfirmed && user && confirmed.length > 1 && (
                        <section
                            aria-labelledby="ratings-title"
                            className="rounded-2xl border border-black/10 p-5"
                        >
                            <h2 id="ratings-title" className="text-xl font-bold">
                                {dict.ratings.title}
                            </h2>
                            <div className="mt-3">
                                <RatingsForm
                                    locale={lang}
                                    matchId={match.id}
                                    dict={dict.ratings}
                                    given={given}
                                    players={confirmed
                                        .filter((p) => p.userId !== user.id && p.attended !== false)
                                        .map((p) => ({ id: p.userId, name: p.name }))}
                                />
                            </div>
                        </section>
                    )}

                    <section aria-labelledby="chat-title">
                        <h2 id="chat-title" className="text-xl font-bold">
                            {dict.chat.title}
                        </h2>
                        <div className="mt-3">
                            {isMember && user ? (
                                <ChatPanel
                                    locale={lang}
                                    matchId={match.id}
                                    messages={messages}
                                    currentUserId={user.id}
                                    canModerate={canManage}
                                    timeLabels={timeLabels}
                                    dict={dict.chat}
                                />
                            ) : (
                                <p className="text-sm text-charcoal/60">{dict.chat.membersOnly}</p>
                            )}
                        </div>
                    </section>

                    <section aria-labelledby="where-title">
                        <h2 id="where-title" className="text-xl font-bold">
                            {t.where}
                        </h2>
                        <p className="mt-2 font-medium">{venue.name}</p>
                        <p className="text-charcoal/70">{venue.address}</p>
                        <p className="mt-1 text-sm text-charcoal/70">
                            {[
                                t.surfaces[venue.surface],
                                venue.has_changing_rooms && t.changingRooms,
                                venue.has_lights && t.lights,
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                        <iframe
                            title={interpolate(t.mapTitle, { venue: venue.name })}
                            src={mapSrc}
                            loading="lazy"
                            className="mt-4 h-64 w-full rounded-2xl border border-black/10"
                        />
                        <a
                            href={directionsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${buttonStyles.link} mt-3 inline-block`}
                        >
                            {t.directions} ↗
                        </a>
                    </section>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                        {!closed && (
                            <p className="mb-4 text-lg font-bold">
                                {spotsLeft > 0
                                    ? interpolate(dict.matchCard.spotsLeft[pluralCategory(spotsLeft, lang)], {
                                          count: spotsLeft,
                                      })
                                    : dict.matchCard.full}
                            </p>
                        )}
                        {joinBlock}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                        <ShareButtons
                            url={url}
                            title={match.title}
                            text={interpolate(t.shareText, {
                                title: match.title,
                                date: shortDate,
                                venue: venue.name,
                            })}
                            dict={t}
                        />
                        <a
                            href={`/api/matches/${match.id}/ics?lang=${lang}`}
                            className={`${buttonStyles.secondary} w-full px-3 py-2 text-sm`}
                        >
                            {t.addToCalendar}
                        </a>
                    </div>

                    {canManage && match.status !== 'cancelled' && match.status !== 'completed' && (
                        <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                            <Link
                                href={`/${lang}/matches/${match.id}/edit`}
                                className={`${buttonStyles.secondary} w-full px-3 py-2 text-sm`}
                            >
                                {t.edit}
                            </Link>
                            <CancelMatchButton
                                locale={lang}
                                matchId={match.id}
                                label={t.cancelMatch}
                                confirmText={t.cancelConfirm}
                            />
                        </div>
                    )}
                </aside>
            </div>
        </article>
    );
}
