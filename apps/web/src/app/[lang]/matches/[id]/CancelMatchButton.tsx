'use client';

import { buttonStyles } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import { cancelMatchAction } from './actions';

interface CancelMatchButtonProps {
    locale: Locale;
    matchId: string;
    label: string;
    confirmText: string;
}

export default function CancelMatchButton({ locale, matchId, label, confirmText }: CancelMatchButtonProps) {
    return (
        <form
            action={cancelMatchAction}
            onSubmit={(event) => {
                if (!window.confirm(confirmText)) event.preventDefault();
            }}
        >
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="matchId" value={matchId} />
            <button type="submit" className={`${buttonStyles.danger} w-full px-3 py-2 text-sm`}>
                {label}
            </button>
        </form>
    );
}
