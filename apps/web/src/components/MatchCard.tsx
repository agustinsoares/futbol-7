import type { Locale } from '@/i18n/config';
import { interpolate, type Dictionary } from '@/i18n/dictionaries';
import { formatMatchDate, formatPrice, pluralCategory } from '@/lib/format';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type MatchFormat = '5v5' | '7v7' | '9v9' | '11v11';

export interface MatchSummary {
    id: string;
    venue: string;
    area: string;
    startsAt: string; // ISO 8601
    format: MatchFormat;
    level: SkillLevel;
    spotsTotal: number;
    spotsTaken: number;
    pricePerPlayer?: number | null;
}

interface MatchCardProps {
    match: MatchSummary;
    locale: Locale;
    dict: Pick<Dictionary, 'matchCard' | 'levels'>;
}

const FEW_SPOTS_THRESHOLD = 2;

export default function MatchCard({ match, locale, dict }: MatchCardProps) {
    const t = dict.matchCard;
    const { venue, area, startsAt, format, level, spotsTotal, spotsTaken, pricePerPlayer } = match;
    const spotsLeft = Math.max(spotsTotal - spotsTaken, 0);
    const isFull = spotsLeft === 0;
    const fewSpots = !isFull && spotsLeft <= FEW_SPOTS_THRESHOLD;
    const filledPercent = spotsTotal > 0 ? (Math.min(spotsTaken, spotsTotal) / spotsTotal) * 100 : 0;

    return (
        <article className="flex flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-primary-strong capitalize">
                        <time dateTime={startsAt}>{formatMatchDate(startsAt, locale)}</time>
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{venue}</h3>
                    <p className="text-sm text-charcoal/70">{area}</p>
                </div>
                <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary-strong">
                    {format}
                </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                    <dt className="text-charcoal/60">{t.level}</dt>
                    <dd className="font-medium">{dict.levels[level]}</dd>
                </div>
                {pricePerPlayer != null && (
                    <div>
                        <dt className="text-charcoal/60">{t.price}</dt>
                        <dd className="font-medium">
                            {formatPrice(pricePerPlayer, locale)} {t.perPlayer}
                        </dd>
                    </div>
                )}
            </dl>

            <div className="mt-4">
                <div
                    className="h-2 overflow-hidden rounded-full bg-surface"
                    role="progressbar"
                    aria-label={t.spotsTaken}
                    aria-valuemin={0}
                    aria-valuemax={spotsTotal}
                    aria-valuenow={spotsTaken}
                >
                    <div
                        className={`h-full rounded-full ${isFull ? 'bg-charcoal/40' : 'bg-primary'}`}
                        style={{ width: `${filledPercent}%` }}
                    />
                </div>
                <p className="mt-2 text-sm">
                    {isFull ? (
                        <span className="font-medium text-charcoal/70">{t.full}</span>
                    ) : (
                        <>
                            <span className="font-semibold">
                                {interpolate(t.spotsLeft[pluralCategory(spotsLeft, locale)], {
                                    count: spotsLeft,
                                })}
                            </span>{' '}
                            <span className="text-charcoal/60">
                                {interpolate(t.ofTotal, { total: spotsTotal })}
                            </span>
                            {fewSpots && (
                                <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent-strong">
                                    {t.lastSpots}
                                </span>
                            )}
                        </>
                    )}
                </p>
            </div>
        </article>
    );
}
