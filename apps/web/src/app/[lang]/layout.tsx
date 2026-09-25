import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { isLocale, LOCALES, OG_LOCALE } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { BRAND_BLUE, SITE_NAME, siteUrl } from '@/lib/site';
import '../globals.css';

const albertSans = localFont({
    src: [
        { path: '../../fonts/AlbertSans-VariableFont_wght.ttf', style: 'normal' },
        { path: '../../fonts/AlbertSans-Italic-VariableFont_wght.ttf', style: 'italic' },
    ],
    weight: '100 900',
    variable: '--font-albert',
    display: 'swap',
});

const novaSquare = localFont({
    src: '../../fonts/NovaSquare-Regular.ttf',
    weight: '400',
    variable: '--font-nova',
    display: 'swap',
});

export const dynamicParams = false;

export function generateStaticParams() {
    return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);

    return {
        metadataBase: siteUrl(),
        title: { default: dict.meta.title, template: `%s · ${SITE_NAME}` },
        description: dict.meta.description,
        applicationName: SITE_NAME,
        alternates: {
            canonical: `/${lang}`,
            languages: { en: '/en', nb: '/nb', 'x-default': '/en' },
        },
        appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black-translucent' },
        openGraph: {
            type: 'website',
            locale: OG_LOCALE[lang],
            alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
            siteName: SITE_NAME,
            title: dict.meta.title,
            description: dict.meta.description,
        },
        twitter: {
            card: 'summary_large_image',
            title: dict.meta.title,
            description: dict.meta.description,
        },
    };
}

export const viewport: Viewport = {
    themeColor: BRAND_BLUE,
};

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const dict = await getDictionary(lang);

    return (
        <html lang={lang} className={`${albertSans.variable} ${novaSquare.variable}`}>
            <body className="flex min-h-screen flex-col">
                <Header locale={lang} dict={dict.nav} />
                <main className="flex-1">{children as ReactNode}</main>
                <Footer locale={lang} dict={dict} />
                <ServiceWorkerRegistration />
            </body>
        </html>
    );
}
