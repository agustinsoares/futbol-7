import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from '@/lib/site';
import './globals.css';

const albertSans = localFont({
    src: [
        { path: '../fonts/AlbertSans-VariableFont_wght.ttf', style: 'normal' },
        { path: '../fonts/AlbertSans-Italic-VariableFont_wght.ttf', style: 'italic' },
    ],
    weight: '100 900',
    variable: '--font-albert',
    display: 'swap',
});

const novaSquare = localFont({
    src: '../fonts/NovaSquare-Regular.ttf',
    weight: '400',
    variable: '--font-nova',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: siteUrl(),
    title: {
        default: `${SITE_NAME} · Partidos de fútbol cerca de ti`,
        template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: {
        type: 'website',
        locale: 'es_ES',
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
    },
};

export const viewport: Viewport = {
    themeColor: '#2979ff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es" className={`${albertSans.variable} ${novaSquare.variable}`}>
            <body className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
