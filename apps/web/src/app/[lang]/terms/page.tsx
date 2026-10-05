import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegalPage from '@/components/LegalPage';
import { LEGAL } from '@/content/legal';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: PageProps<'/[lang]/terms'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    return {
        title: LEGAL[lang].terms.title,
        alternates: { canonical: `/${lang}/terms`, languages: { en: '/en/terms', nb: '/nb/terms' } },
    };
}

export default async function Page({ params }: PageProps<'/[lang]/terms'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    return <LegalPage doc={LEGAL[lang].terms} />;
}
