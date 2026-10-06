'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Alert, buttonStyles, Field, Input } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { requestResetAction, type ForgotState } from './actions';

interface ForgotFormProps {
    locale: Locale;
    dict: Dictionary['password'];
    authDict: Dictionary['auth'];
}

export default function ForgotForm({ locale, dict, authDict }: ForgotFormProps) {
    const [state, action, pending] = useActionState<ForgotState, FormData>(requestResetAction, {});
    const backLink = (
        <p className="text-center text-sm">
            <Link href={`/${locale}/login`} className={buttonStyles.link}>
                {dict.backToSignIn}
            </Link>
        </p>
    );

    if (state.sent) {
        return (
            <div className="space-y-6">
                <Alert tone="success">{dict.sent}</Alert>
                {backLink}
            </div>
        );
    }

    return (
        <form action={action} className="space-y-4" noValidate>
            {state.error && state.error !== 'invalidEmail' && (
                <Alert tone="error">{authDict.errors[state.error]}</Alert>
            )}
            <input type="hidden" name="lang" value={locale} />
            <Field
                label={authDict.email}
                htmlFor="email"
                error={state.error === 'invalidEmail' ? authDict.errors.invalidEmail : undefined}
            >
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={state.email}
                    aria-invalid={state.error === 'invalidEmail'}
                />
            </Field>
            <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
                {dict.sendLink}
            </button>
            {backLink}
        </form>
    );
}
