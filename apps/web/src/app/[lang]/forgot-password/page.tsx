import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import ForgotForm from './ForgotForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/forgot-password'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.password.forgotTitle, robots: { index: false } };
}

export default async function ForgotPasswordPage({ params }: PageProps<'/[lang]/forgot-password'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const dict = await getDictionary(lang);

    return (
        <section className="mx-auto max-w-md px-4 py-12 sm:py-16">
            <PageHeader title={dict.password.forgotTitle} subtitle={dict.password.forgotSubtitle} />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <ForgotForm locale={lang} dict={dict.password} authDict={dict.auth} />
            </div>
        </section>
    );
}
