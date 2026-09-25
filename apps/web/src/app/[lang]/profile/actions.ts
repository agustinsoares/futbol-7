'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES } from '@/i18n/config';
import { cookies } from 'next/headers';
import { safeNextPath } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ProfileFormState {
    saved?: boolean;
    error?: 'nameRequired' | 'generic';
}

const schema = z.object({
    fullName: z.string().trim().min(2).max(80),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward', 'any']).nullable(),
    locale: z.enum(LOCALES),
});

export async function saveProfileAction(
    _prev: ProfileFormState,
    formData: FormData,
): Promise<ProfileFormState> {
    const lang = String(formData.get('lang') ?? '');
    const currentLocale = isLocale(lang) ? lang : DEFAULT_LOCALE;

    const parsed = schema.safeParse({
        fullName: formData.get('fullName'),
        skillLevel: formData.get('skillLevel'),
        position: formData.get('position') || null,
        locale: formData.get('locale'),
    });
    if (!parsed.success) {
        const nameIssue = parsed.error.issues.some((i) => i.path[0] === 'fullName');
        return { error: nameIssue ? 'nameRequired' : 'generic' };
    }

    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/${currentLocale}/login?next=/${currentLocale}/profile`);

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: parsed.data.fullName,
            skill_level: parsed.data.skillLevel,
            preferred_position: parsed.data.position,
            locale: parsed.data.locale,
        })
        .eq('id', user.id);
    if (error) return { error: 'generic' };

    // El idioma del perfil también pasa a ser el idioma del sitio.
    (await cookies()).set(LOCALE_COOKIE, parsed.data.locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
    });
    revalidatePath(`/${currentLocale}/profile`);

    const next = formData.get('next');
    if (typeof next === 'string' && next) {
        // Onboarding: seguir a donde iba, en el idioma elegido.
        const target = safeNextPath(next, parsed.data.locale).replace(
            /^\/(en|nb)(?=\/|$)/,
            `/${parsed.data.locale}`,
        );
        redirect(target);
    }
    if (parsed.data.locale !== currentLocale) redirect(`/${parsed.data.locale}/profile?saved=1`);
    return { saved: true };
}
