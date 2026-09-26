'use client';

import { useActionState } from 'react';
import { Alert, buttonStyles } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { rateAction, type SimpleFormState } from './actions';

interface RatingsFormProps {
    locale: Locale;
    matchId: string;
    players: { id: string; name: string }[];
    given: Record<string, number>;
    dict: Dictionary['ratings'];
}

export default function RatingsForm({ locale, matchId, players, given, dict }: RatingsFormProps) {
    const [state, action, pending] = useActionState<SimpleFormState, FormData>(rateAction, {});

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="matchId" value={matchId} />
            <p className="text-sm text-charcoal/70">{dict.hint}</p>
            {state.ok && <Alert tone="success">{dict.saved}</Alert>}
            {state.error && <Alert tone="error">{dict.errors.generic}</Alert>}
            <ul className="divide-y divide-black/5">
                {players.map((player) => (
                    <li key={player.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                        <span className="font-medium">{player.name}</span>
                        <fieldset className="stars">
                            <legend className="sr-only">{player.name}</legend>
                            {[5, 4, 3, 2, 1].map((stars) => (
                                <label key={stars} title={dict.starLabel.replace('{score}', String(stars))}>
                                    <input
                                        type="radio"
                                        name={`rating:${player.id}`}
                                        value={stars}
                                        defaultChecked={given[player.id] === stars}
                                        className="sr-only"
                                    />
                                    <span aria-hidden="true">★</span>
                                    <span className="sr-only">
                                        {dict.starLabel.replace('{score}', String(stars))}
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                    </li>
                ))}
            </ul>
            <button type="submit" disabled={pending} className={buttonStyles.primary}>
                {dict.save}
            </button>
        </form>
    );
}
