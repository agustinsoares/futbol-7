import { formatMatchDate, formatPrice } from '@/lib/format';

export type MatchLevel = 'Iniciación' | 'Intermedio' | 'Avanzado';

export interface MatchCardProps {
    venue: string;
    area: string;
    startsAt: string; // ISO 8601
    format: 'F5' | 'F7' | 'F11';
    level: MatchLevel;
    spotsTotal: number;
    spotsTaken: number;
    pricePerPlayer?: number;
}

const FEW_SPOTS_THRESHOLD = 2;

export default function MatchCard({
    venue,
    area,
    startsAt,
    format,
    level,
    spotsTotal,
    spotsTaken,
    pricePerPlayer,
}: MatchCardProps) {
    const spotsLeft = Math.max(spotsTotal - spotsTaken, 0);
    const isFull = spotsLeft === 0;
    const fewSpots = !isFull && spotsLeft <= FEW_SPOTS_THRESHOLD;

    return (
        <article className="flex flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-primary-strong capitalize">
                        <time dateTime={startsAt}>{formatMatchDate(startsAt)}</time>
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
                    <dt className="text-charcoal/60">Nivel</dt>
                    <dd className="font-medium">{level}</dd>
                </div>
                {pricePerPlayer !== undefined && (
                    <div>
                        <dt className="text-charcoal/60">Precio</dt>
                        <dd className="font-medium">{formatPrice(pricePerPlayer)} / jugador</dd>
                    </div>
                )}
            </dl>

            <div className="mt-4">
                <div
                    className="h-2 overflow-hidden rounded-full bg-surface"
                    role="progressbar"
                    aria-label="Plazas ocupadas"
                    aria-valuemin={0}
                    aria-valuemax={spotsTotal}
                    aria-valuenow={spotsTaken}
                >
                    <div
                        className={`h-full rounded-full ${isFull ? 'bg-charcoal/40' : 'bg-primary'}`}
                        style={{ width: `${(Math.min(spotsTaken, spotsTotal) / spotsTotal) * 100}%` }}
                    />
                </div>
                <p className="mt-2 text-sm">
                    {isFull ? (
                        <span className="font-medium text-charcoal/70">Completo · lista de espera</span>
                    ) : (
                        <>
                            <span className="font-semibold">
                                {spotsLeft} {spotsLeft === 1 ? 'plaza libre' : 'plazas libres'}
                            </span>{' '}
                            <span className="text-charcoal/60">de {spotsTotal}</span>
                            {fewSpots && (
                                <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent-strong">
                                    ¡Últimas!
                                </span>
                            )}
                        </>
                    )}
                </p>
            </div>
        </article>
    );
}
