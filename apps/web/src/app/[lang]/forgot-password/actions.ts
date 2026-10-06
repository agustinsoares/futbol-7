'use server';

import { z } from 'zod';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { mapAuthError, type AuthErrorKey } from '@/lib/auth-errors';
import { requestOrigin } from '@/lib/request-origin';
import { supabaseEnv } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ForgotState {
    error?: AuthErrorKey;
    sent?: boolean;
    email?: string;
}

export async function requestResetAction(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
    if (!supabaseEnv()) return { error: 'notConfigured' };
    const lang = String(formData.get('lang') ?? '');
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const rawEmail = String(formData.get('email') ?? '');
    const email = z.string().trim().toLowerCase().email().safeParse(rawEmail);
    if (!email.success) return { error: 'invalidEmail', email: rawEmail };

    const supabase = await createSupabaseServerClient();
    const origin = await requestOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
        redirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent(`/${locale}/reset-password`)}`,
    });
    // Mismo mensaje exista o no la cuenta, para no revelar qué emails están registrados.
    if (error && mapAuthError(error) === 'rateLimited') return { error: 'rateLimited', email: rawEmail };
    if (error && error.code !== 'user_not_found') return { error: 'generic', email: rawEmail };
    return { sent: true };
}
