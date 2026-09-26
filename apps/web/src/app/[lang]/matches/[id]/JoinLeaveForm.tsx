'use client';

import { useActionState } from 'react';
import { Alert, buttonStyles } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { joinMatchAction, leaveMatchAction, type JoinFormState } from './actions';

interface JoinLeaveFormProps {
    locale: Locale;
    matchId: string;
    mode: 'join' | 'joinWaitlist' | 'leave' | 'leaveWaitlist';
    dict: Dictionary['match'];
}

export default function JoinLeaveForm({ locale, matchId, mode, dict }: JoinLeaveFormProps) {
    const leaving = mode === 'leave' || mode === 'leaveWaitlist';
    const [state, action, pending] = useActionState<JoinFormState, FormData>(
        leaving ? leaveMatchAction : joinMatchAction,
        {},
    );

    return (
        <form action={action} className="space-y-3">
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="matchId" value={matchId} />
            {state.error && <Alert tone="error">{dict.errors[state.error]}</Alert>}
            <button
                type="submit"
                disabled={pending}
                className={`${leaving ? buttonStyles.secondary : buttonStyles.primary} w-full`}
            >
                {dict[mode]}
            </button>
        </form>
    );
}
