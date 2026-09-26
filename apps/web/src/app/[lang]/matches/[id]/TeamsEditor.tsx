'use client';

import { useActionState, useState } from 'react';
import { Alert, buttonStyles } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { balanceTeams, playerWeight, type TeamPlayer } from '@/lib/teams';
import { saveTeamsAction, type SimpleFormState } from './actions';

export interface EditorPlayer extends TeamPlayer {
    name: string;
    team: 'A' | 'B' | null;
}

interface TeamsEditorProps {
    locale: Locale;
    matchId: string;
    players: EditorPlayer[];
    dict: Dictionary['teams'];
}

function interpolateStrength(template: string, value: number) {
    return template.replace('{value}', String(value));
}

export default function TeamsEditor({ locale, matchId, players, dict }: TeamsEditorProps) {
    const [state, action, pending] = useActionState<SimpleFormState, FormData>(saveTeamsAction, {});
    const [teams, setTeams] = useState(() => ({
        a: players.filter((p) => p.team === 'A').map((p) => p.id),
        b: players.filter((p) => p.team === 'B').map((p) => p.id),
    }));
    const byId = new Map(players.map((p) => [p.id, p]));
    const hasTeams = teams.a.length + teams.b.length > 0;

    const strength = (ids: string[]) => ids.reduce((sum, id) => sum + playerWeight(byId.get(id)!), 0);
    const move = (id: string) =>
        setTeams((t) =>
            t.a.includes(id)
                ? { a: t.a.filter((x) => x !== id), b: [...t.b, id] }
                : { a: [...t.a, id], b: t.b.filter((x) => x !== id) },
        );

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="matchId" value={matchId} />
            {teams.a.map((id) => (
                <input key={`a-${id}`} type="hidden" name="teamA" value={id} />
            ))}
            {teams.b.map((id) => (
                <input key={`b-${id}`} type="hidden" name="teamB" value={id} />
            ))}

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    className={`${buttonStyles.secondary} px-3 py-2 text-sm`}
                    onClick={() => setTeams(balanceTeams(players))}
                >
                    {dict.make}
                </button>
                {hasTeams && (
                    <button
                        type="button"
                        className={`${buttonStyles.secondary} px-3 py-2 text-sm`}
                        onClick={() => setTeams(balanceTeams(players, Math.random))}
                    >
                        {dict.reshuffle}
                    </button>
                )}
            </div>

            {hasTeams && (
                <>
                    <p className="text-sm text-charcoal/70">{dict.hint}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {(['a', 'b'] as const).map((key) => (
                            <div key={key} className="rounded-xl bg-surface p-4">
                                <p className="flex justify-between font-semibold">
                                    {key === 'a' ? dict.teamA : dict.teamB}
                                    <span className="text-sm font-medium text-charcoal/60">
                                        {interpolateStrength(dict.strength, strength(teams[key]))}
                                    </span>
                                </p>
                                <ul className="mt-2 space-y-1">
                                    {teams[key].map((id) => (
                                        <li key={id}>
                                            <button
                                                type="button"
                                                onClick={() => move(id)}
                                                className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-white"
                                            >
                                                {byId.get(id)?.name} {key === 'a' ? '→' : '←'}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    {state.error && <Alert tone="error">{dict.errors.generic}</Alert>}
                    <button type="submit" disabled={pending} className={buttonStyles.primary}>
                        {dict.save}
                    </button>
                </>
            )}
        </form>
    );
}
