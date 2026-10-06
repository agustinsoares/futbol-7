'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Alert, buttonStyles, Field, Input } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { updatePasswordAction, type ResetState } from './actions';

interface ResetFormProps {
    locale: Locale;
    dict: Dictionary['password'];
    authDict: Dictionary['auth'];
}

export default function ResetForm({ locale, dict, authDict }: ResetFormProps) {
    const [state, action, pending] = useActionState<ResetState, FormData>(updatePasswordAction, {});

    if (state.saved) {
        return (
            <div className="space-y-6">
                <Alert tone="success">{dict.saved}</Alert>
                <Link href={`/${locale}/matches`} className={`${buttonStyles.primary} w-full`}>
                    {dict.goToMatches}
                </Link>
            </div>
        );
    }

    if (state.error === 'needsLink') {
        return (
            <div className="space-y-6">
                <Alert tone="error">{dict.needsLink}</Alert>
                <Link href={`/${locale}/forgot-password`} className={`${buttonStyles.primary} w-full`}>
                    {dict.requestNew}
                </Link>
            </div>
        );
    }

    const fieldError =
        state.error === 'weakPassword'
            ? authDict.errors.weakPassword
            : state.error === 'mismatch'
              ? dict.errors.mismatch
              : state.error === 'samePassword'
                ? dict.errors.samePassword
                : undefined;
    const formError =
        state.error && !fieldError ? authDict.errors[state.error as keyof typeof authDict.errors] : null;

    return (
        <form action={action} className="space-y-4" noValidate>
            {formError && <Alert tone="error">{formError}</Alert>}
            <Field
                label={dict.newPassword}
                htmlFor="password"
                hint={authDict.passwordHint}
                error={fieldError}
            >
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    aria-invalid={!!fieldError}
                />
            </Field>
            <Field label={dict.confirmPassword} htmlFor="confirm">
                <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
            </Field>
            <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
                {dict.save}
            </button>
        </form>
    );
}
