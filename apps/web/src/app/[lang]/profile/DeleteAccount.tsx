'use client';

import { useActionState } from 'react';
import { Alert, buttonStyles } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { deleteAccountAction, type DeleteAccountState } from './actions';

export default function DeleteAccount({ locale, dict }: { locale: Locale; dict: Dictionary['account'] }) {
    const [state, action, pending] = useActionState<DeleteAccountState, FormData>(deleteAccountAction, {});
    return (
        <details className="rounded-2xl border border-accent-strong/20 bg-white p-6 shadow-sm">
            <summary className="cursor-pointer font-semibold text-accent-strong">{dict.deleteTitle}</summary>
            <form action={action} className="mt-4 space-y-4">
                <p className="text-sm text-charcoal/80">{dict.deleteText}</p>
                {state.error && (
                    <Alert tone="error">
                        {state.error === 'confirm' ? dict.confirmRequired : dict.deleteError}
                    </Alert>
                )}
                <input type="hidden" name="lang" value={locale} />
                <label className="flex items-start gap-2 text-sm font-medium">
                    <input
                        type="checkbox"
                        name="confirm"
                        value="yes"
                        className="mt-0.5 h-4 w-4 accent-accent-strong"
                    />
                    {dict.confirmLabel}
                </label>
                <button type="submit" disabled={pending} className={buttonStyles.danger}>
                    {dict.deleteButton}
                </button>
            </form>
        </details>
    );
}
