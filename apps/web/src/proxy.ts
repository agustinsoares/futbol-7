import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, LOCALE_COOKIE, localeFromAcceptLanguage, LOCALES } from '@/i18n/config';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * 1. Toda ruta vive bajo /en o /nb. Si la URL no trae idioma, redirigimos:
 *    primero según la cookie (elección previa del usuario), si no según el navegador.
 * 2. En las rutas con idioma, refrescamos la sesión de Supabase.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const hasLocale = LOCALES.some(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    );
    if (hasLocale) return updateSession(request);

    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(cookieLocale)
        ? cookieLocale
        : localeFromAcceptLanguage(request.headers.get('accept-language'));

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
}

export const config = {
    // Excluye assets, APIs y archivos con extensión (sw.js, manifest, iconos, imágenes).
    matcher: ['/((?!api|_next/static|_next/image|images|.*\\..*).*)'],
};
