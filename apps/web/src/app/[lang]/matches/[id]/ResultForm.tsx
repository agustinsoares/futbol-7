'use client';

import { useActionState } from 'react';
import { Alert, buttonStyles, Input } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { recordResultAction, type SimpleFormState } from './actions';

interface ResultFormProps {
    locale: Locale;
    matchId: string;
    players: { id: string; name: string; attended: boolean | null }[];
    initialScore: { a: number | null; b: number | null };
    dict: Pick<Dictionary, 'result' | 'teams'>;
}

export default function ResultForm({ locale, matchId, players, initialScore, dict }: ResultFormProps) {
    const t = dict.result;
    const [state, action, pending] = useActionState<SimpleFormState, FormData>(recordResultAction, {});
    const errorKey = state.error as keyof typeof t.errors | undefined;

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="matchId" value={matchId} />
            {errorKey && <Alert tone="error">{t.errors[errorKey] ?? t.errors.generic}</Alert>}
            <div className="flex items-end gap-3">
                <label className="flex-1 text-sm font-semibold">
                    {dict.teams.teamA}
                    <Input
                        name="scoreA"
                        type="number"
                        min={0}
                        max={99}
                        inputMode="numeric"
                        defaultValue={initialScore.a ?? ''}
                        className="mt-1.5 text-center text-lg"
                        required
                    />
                </label>
                <span className="pb-3 text-xl font-bold">–</span>
                <label className="flex-1 text-sm font-semibold">
                    {dict.teams.teamB}
                    <Input
                        name="scoreB"
                        type="number"
                        min={0}
                        max={99}
                        inputMode="numeric"
                        defaultValue={initialScore.b ?? ''}
                        className="mt-1.5 text-center text-lg"
                        required
                    />
                </label>
            </div>
            <fieldset>
                <legend className="text-sm font-semibold">{t.attendance}</legend>
                <p className="text-sm text-charcoal/60">{t.attendanceHint}</p>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {players.map((player) => (
                        <li key={player.id}>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="attended"
                                    value={player.id}
                                    defaultChecked={player.attended ?? true}
                                    className="h-4 w-4 accent-primary-strong"
                                />
                                {player.name}
                            </label>
                        </li>
                    ))}
                </ul>
            </fieldset>
            <button type="submit" disabled={pending} className={buttonStyles.primary}>
                {t.save}
            </button>
        </form>
    );
}
