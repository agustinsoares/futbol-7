import Link from 'next/link';
import { lang } from 'next/root-params';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export default async function NotFound() {
    const current = await lang();
    const locale = isLocale(current) ? current : DEFAULT_LOCALE;
    const dict = await getDictionary(locale);

    return (
        <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
            <p className="font-display text-6xl text-primary">404</p>
            <h1 className="mt-4 text-3xl">{dict.notFound.title}</h1>
            <p className="mt-3 text-charcoal/70">{dict.notFound.text}</p>
            <Link
                href={`/${locale}`}
                className="mt-8 rounded-lg bg-primary-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-primary"
            >
                {dict.notFound.back}
            </Link>
        </section>
    );
}
