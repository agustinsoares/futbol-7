'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALE_COOKIE, LOCALE_NAMES, LOCALES, type Locale } from '@/i18n/config';

const ONE_YEAR = 60 * 60 * 24 * 365;

function pathForLocale(pathname: string, locale: Locale): string {
    const segments = pathname.split('/');
    // segments[0] es '' y segments[1] es el idioma actual.
    segments[1] = locale;
    return segments.join('/') || `/${locale}`;
}

export default function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
    const pathname = usePathname() ?? `/${current}`;

    return (
        <nav
            aria-label={label}
            className="flex items-center rounded-lg bg-white/10 p-0.5 text-xs font-semibold"
        >
            {LOCALES.map((locale) => {
                const active = locale === current;
                return (
                    <Link
                        key={locale}
                        href={pathForLocale(pathname, locale)}
                        hrefLang={locale}
                        lang={locale}
                        aria-current={active ? 'true' : undefined}
                        title={LOCALE_NAMES[locale]}
                        onClick={() => {
                            document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
                        }}
                        className={`rounded-md px-2 py-1 uppercase transition-colors ${
                            active ? 'bg-white text-charcoal' : 'text-white/80 hover:text-white'
                        }`}
                    >
                        {locale === 'nb' ? 'NO' : 'EN'}
                    </Link>
                );
            })}
        </nav>
    );
}
