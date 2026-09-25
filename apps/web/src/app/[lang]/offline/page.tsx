import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RetryButton from '@/components/RetryButton';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

// Página que el service worker muestra cuando no hay conexión.
export async function generateMetadata({ params }: PageProps<'/[lang]/offline'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.offline.title, robots: { index: false } };
}

export default async function OfflinePage({ params }: PageProps<'/[lang]/offline'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const dict = await getDictionary(lang);

    return (
        <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
            <h1 className="text-3xl">{dict.offline.title}</h1>
            <p className="mt-3 text-charcoal/70">{dict.offline.text}</p>
            <RetryButton label={dict.offline.retry} />
        </section>
    );
}
