'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Alert, buttonStyles, Field, Input } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { magicLinkAction, signInAction, signUpAction, type AuthFormState } from './actions';

interface AuthFormProps {
    mode: 'signin' | 'signup';
    locale: Locale;
    next: string;
    dict: Dictionary['auth'];
    initialError?: keyof Dictionary['auth']['errors'];
    googleEnabled: boolean;
}

export default function AuthForm({ mode, locale, next, dict, initialError, googleEnabled }: AuthFormProps) {
    const [passwordState, passwordAction, passwordPending] = useActionState<AuthFormState, FormData>(
        mode === 'signin' ? signInAction : signUpAction,
        initialError ? { error: initialError } : {},
    );
    const [magicState, magicAction, magicPending] = useActionState<AuthFormState, FormData>(
        magicLinkAction,
        {},
    );
    const [googleError, setGoogleError] = useState(false);

    const state =
        magicState.checkEmail || magicState.error || magicState.fieldErrors ? magicState : passwordState;
    const pending = passwordPending || magicPending;
    const err = (key?: keyof Dictionary['auth']['errors']) => (key ? dict.errors[key] : undefined);
    const otherMode = mode === 'signin' ? 'signup' : 'signin';
    const otherHref = `/${locale}/login?mode=${otherMode}&next=${encodeURIComponent(next)}`;

    async function signInWithGoogle() {
        setGoogleError(false);
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });
        if (error) setGoogleError(true);
    }

    if (state.checkEmail) {
        return <Alert tone="success">{dict.checkEmail}</Alert>;
    }

    return (
        <div className="space-y-6">
            {(state.error || googleError) && (
                <Alert tone="error">{err(state.error) ?? dict.errors.generic}</Alert>
            )}

            <form action={passwordAction} className="space-y-4" noValidate>
                <input type="hidden" name="lang" value={locale} />
                <input type="hidden" name="next" value={next} />
                {mode === 'signup' && (
                    <Field label={dict.fullName} htmlFor="fullName" error={err(state.fieldErrors?.fullName)}>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={state.fullName}
                            autoComplete="name"
                            required
                            maxLength={80}
                            aria-invalid={!!state.fieldErrors?.fullName}
                        />
                    </Field>
                )}
                <Field label={dict.email} htmlFor="email" error={err(state.fieldErrors?.email)}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        defaultValue={state.email}
                        aria-invalid={!!state.fieldErrors?.email}
                    />
                </Field>
                <Field
                    label={dict.password}
                    htmlFor="password"
                    hint={mode === 'signup' ? dict.passwordHint : undefined}
                    error={err(state.fieldErrors?.password)}
                >
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        required
                        minLength={mode === 'signup' ? 8 : undefined}
                        aria-invalid={!!state.fieldErrors?.password}
                    />
                </Field>
                <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
                    {mode === 'signin' ? dict.signInButton : dict.signUpButton}
                </button>
                {mode === 'signin' && (
                    <button
                        type="submit"
                        formAction={magicAction}
                        formNoValidate
                        disabled={pending}
                        className={`${buttonStyles.secondary} w-full`}
                    >
                        {dict.magicLinkButton}
                    </button>
                )}
            </form>

            {googleEnabled && (
                <>
                    <div className="flex items-center gap-3 text-sm text-charcoal/60">
                        <span className="h-px flex-1 bg-black/10" />
                        {dict.or}
                        <span className="h-px flex-1 bg-black/10" />
                    </div>
                    <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={pending}
                        className={`${buttonStyles.secondary} w-full`}
                    >
                        {dict.googleButton}
                    </button>
                </>
            )}

            <p className="text-center text-sm text-charcoal/70">
                {mode === 'signin' ? dict.noAccount : dict.haveAccount}{' '}
                <Link href={otherHref} className={buttonStyles.link}>
                    {mode === 'signin' ? dict.createAccount : dict.signInLink}
                </Link>
            </p>
        </div>
    );
}
