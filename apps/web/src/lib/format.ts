import { LOCALE, TIME_ZONE } from './site';

// Locale y zona horaria fijas: así el HTML del servidor y el del navegador coinciden
// (evita errores de hidratación) y todos ven la hora local de la cancha.
const matchDateFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
});

export function formatMatchDate(iso: string): string {
    return matchDateFormatter.format(new Date(iso));
}

export function formatPrice(amount: number): string {
    return currencyFormatter.format(amount);
}
