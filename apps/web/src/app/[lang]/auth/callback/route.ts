import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { isProfileComplete, safeNextPath } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Destino de los enlaces de Supabase (confirmar email, enlace mágico, Google).
 * Acepta tanto ?code= (PKCE) como ?token_hash=&type= (plantillas de email con token).
 */
export async function GET(request: NextRequest, { params }: RouteContext<'/[lang]/auth/callback'>) {
    const { lang } = await params;
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const url = request.nextUrl;
    const next = safeNextPath(url.searchParams.get('next'), locale);
    const code = url.searchParams.get('code');
    const tokenHash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type') as EmailOtpType | null;

    const supabase = await createSupabaseServerClient();
    let ok = false;
    if (code) {
        ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
    } else if (tokenHash && type) {
        ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
    }

    if (!ok) {
        return NextResponse.redirect(new URL(`/${locale}/login?error=link`, url.origin));
    }

    // Primera vez: completar el perfil antes de seguir.
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (!isProfileComplete(profile)) {
            return NextResponse.redirect(
                new URL(`/${locale}/profile?welcome=1&next=${encodeURIComponent(next)}`, url.origin),
            );
        }
    }

    return NextResponse.redirect(new URL(next, url.origin));
}
