import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegalPage from '@/components/LegalPage';
import { LEGAL } from '@/content/legal';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: PageProps<'/[lang]/privacy'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    return {
        title: LEGAL[lang].privacy.title,
        alternates: { canonical: `/${lang}/privacy`, languages: { en: '/en/privacy', nb: '/nb/privacy' } },
    };
}

export default async function Page({ params }: PageProps<'/[lang]/privacy'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    return <LegalPage doc={LEGAL[lang].privacy} />;
}
