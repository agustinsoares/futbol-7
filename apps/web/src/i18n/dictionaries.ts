import 'server-only';
import type { Locale } from './config';
import type { Dictionary } from './dictionaries/en';

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('./dictionaries/en').then((m) => m.default),
    nb: () => import('./dictionaries/nb').then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
    return dictionaries[locale]();
}

export type { Dictionary };

/** Sustituye {clave} por su valor: t('{count} plazas', { count: 3 }). */
export function interpolate(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
