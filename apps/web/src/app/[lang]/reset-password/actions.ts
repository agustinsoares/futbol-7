'use server';

import { z } from 'zod';
import { mapAuthError, type AuthErrorKey } from '@/lib/auth-errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ResetState {
    error?: AuthErrorKey | 'mismatch' | 'samePassword' | 'needsLink';
    saved?: boolean;
}

export async function updatePasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
    const password = z.string().min(8).max(72).safeParse(formData.get('password'));
    if (!password.success) return { error: 'weakPassword' };
    if (formData.get('confirm') !== password.data) return { error: 'mismatch' };

    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'needsLink' };

    const { error } = await supabase.auth.updateUser({ password: password.data });
    if (error?.code === 'same_password') return { error: 'samePassword' };
    if (error) return { error: mapAuthError(error) };
    return { saved: true };
}
