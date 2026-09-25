export const LOCALES = ['en', 'nb'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

// Locale BCP 47 completo para Intl (fechas, monedas, plurales).
export const INTL_LOCALE: Record<Locale, string> = {
    en: 'en-GB',
    nb: 'nb-NO',
};

export const OG_LOCALE: Record<Locale, string> = {
    en: 'en_GB',
    nb: 'nb_NO',
};

export const LOCALE_NAMES: Record<Locale, string> = {
    en: 'English',
    nb: 'Norsk',
};

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Elige el idioma a partir de la cabecera Accept-Language.
 * Cualquier variante de noruego (nb, no, nn) cae en bokmål; el resto, en inglés.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
    if (!header) return DEFAULT_LOCALE;

    const languages = header
        .split(',')
        .map((part) => {
            const [tag, ...params] = part.trim().toLowerCase().split(';');
            const q = params.find((p) => p.trim().startsWith('q='));
            return { tag, q: q ? Number(q.trim().slice(2)) || 0 : 1 };
        })
        .sort((a, b) => b.q - a.q);

    for (const { tag } of languages) {
        const base = tag.split('-')[0];
        if (base === 'nb' || base === 'no' || base === 'nn') return 'nb';
        if (base === 'en') return 'en';
    }
    return DEFAULT_LOCALE;
}
