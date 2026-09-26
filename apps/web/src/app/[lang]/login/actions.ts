'use server';

import type { AuthError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { isProfileComplete, safeNextPath } from '@/lib/auth';
import { requestOrigin } from '@/lib/request-origin';
import { supabaseEnv } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AuthErrorKey = keyof Dictionary['auth']['errors'];

export interface AuthFormState {
    error?: AuthErrorKey;
    fieldErrors?: Partial<Record<'email' | 'password' | 'fullName', AuthErrorKey>>;
    checkEmail?: boolean;
    email?: string;
    fullName?: string;
}

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8).max(72);
const nameSchema = z.string().trim().min(2).max(80);

function mapAuthError(error: AuthError): AuthErrorKey {
    switch (error.code) {
        case 'invalid_credentials':
            return 'invalidCredentials';
        case 'email_not_confirmed':
            return 'emailNotConfirmed';
        case 'user_already_exists':
        case 'email_exists':
            return 'emailTaken';
        case 'weak_password':
            return 'weakPassword';
        case 'over_request_rate_limit':
        case 'over_email_send_rate_limit':
            return 'rateLimited';
        case 'email_address_invalid':
        case 'validation_failed':
            return 'invalidEmail';
        default:
            return 'generic';
    }
}

function readCommon(formData: FormData) {
    const lang = String(formData.get('lang') ?? '');
    const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const next = safeNextPath(String(formData.get('next') ?? ''), locale);
    return { locale, next };
}

async function redirectAfterSignIn(locale: Locale, next: string): Promise<never> {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (!isProfileComplete(profile)) {
            redirect(`/${locale}/profile?welcome=1&next=${encodeURIComponent(next)}`);
        }
    }
    redirect(next);
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    if (!supabaseEnv()) return { error: 'notConfigured' };
    const { locale, next } = readCommon(formData);
    const email = emailSchema.safeParse(formData.get('email'));
    const password = z.string().min(1).safeParse(formData.get('password'));
    const rawEmail = String(formData.get('email') ?? '');
    if (!email.success) return { fieldErrors: { email: 'invalidEmail' }, email: rawEmail };
    if (!password.success) return { error: 'invalidCredentials', email: rawEmail };

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
    if (error) return { error: mapAuthError(error), email: rawEmail };

    return redirectAfterSignIn(locale, next);
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    if (!supabaseEnv()) return { error: 'notConfigured' };
    const { locale, next } = readCommon(formData);
    const rawEmail = String(formData.get('email') ?? '');
    const rawName = String(formData.get('fullName') ?? '');
    const email = emailSchema.safeParse(formData.get('email'));
    const password = passwordSchema.safeParse(formData.get('password'));
    const fullName = nameSchema.safeParse(formData.get('fullName'));

    const fieldErrors: AuthFormState['fieldErrors'] = {};
    if (!fullName.success) fieldErrors.fullName = 'nameRequired';
    if (!email.success) fieldErrors.email = 'invalidEmail';
    if (!password.success) fieldErrors.password = 'weakPassword';
    if (!fullName.success || !email.success || !password.success) {
        return { fieldErrors, email: rawEmail, fullName: rawName };
    }

    const supabase = await createSupabaseServerClient();
    const origin = await requestOrigin();
    const { data, error } = await supabase.auth.signUp({
        email: email.data,
        password: password.data,
        options: {
            data: { full_name: fullName.data, locale },
            emailRedirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`,
        },
    });
    if (error) return { error: mapAuthError(error), email: rawEmail, fullName: rawName };

    // Con confirmación de email activada no hay sesión todavía: hay que abrir el enlace.
    if (!data.session) return { checkEmail: true, email: rawEmail };
    return redirectAfterSignIn(locale, next);
}

export async function magicLinkAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    if (!supabaseEnv()) return { error: 'notConfigured' };
    const { locale, next } = readCommon(formData);
    const rawEmail = String(formData.get('email') ?? '');
    const email = emailSchema.safeParse(formData.get('email'));
    if (!email.success) return { fieldErrors: { email: 'invalidEmail' }, email: rawEmail };

    const supabase = await createSupabaseServerClient();
    const origin = await requestOrigin();
    const { error } = await supabase.auth.signInWithOtp({
        email: email.data,
        options: {
            emailRedirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`,
            data: { locale },
        },
    });
    if (error) return { error: mapAuthError(error), email: rawEmail };
    return { checkEmail: true, email: rawEmail };
}
