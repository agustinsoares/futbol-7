'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function setRoleAction(formData: FormData): Promise<void> {
    const lang = String(formData.get('lang') ?? '');
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const userId = String(formData.get('userId') ?? '');
    const role = formData.get('role') === 'admin' ? 'admin' : 'user';
    const q = String(formData.get('q') ?? '');
    const back = `/${locale}/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`;

    // set_user_role comprueba en la base que quien llama es admin.
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc('set_user_role', { p_user_id: userId, p_role: role });
    revalidatePath(`/${locale}/admin/users`);
    if (error) redirect(`${back}${q ? '&' : '?'}error=1`);
    redirect(back);
}
