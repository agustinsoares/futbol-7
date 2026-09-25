import { INTL_LOCALE, type Locale } from '@/i18n/config';
import { CURRENCY, TIME_ZONE } from './site';

// Locale y zona horaria fijas: así el HTML del servidor y el del navegador coinciden
// (evita errores de hidratación) y todos ven la hora local de la cancha.
export function formatMatchDate(iso: string, locale: Locale): string {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
        timeZone: TIME_ZONE,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

export function formatPrice(amount: number, locale: Locale): string {
    return new Intl.NumberFormat(INTL_LOCALE[locale], {
        style: 'currency',
        currency: CURRENCY,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function pluralCategory(count: number, locale: Locale): 'one' | 'other' {
    return new Intl.PluralRules(INTL_LOCALE[locale]).select(count) === 'one' ? 'one' : 'other';
}
