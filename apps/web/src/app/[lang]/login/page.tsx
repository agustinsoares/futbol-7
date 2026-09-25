import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurrentUser, safeNextPath } from '@/lib/auth';
import AuthForm from './AuthForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/login'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.auth.signInTitle, robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<'/[lang]/login'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const query = await searchParams;
    const mode = query.mode === 'signup' ? 'signup' : 'signin';
    const next = safeNextPath(typeof query.next === 'string' ? query.next : null, lang);

    if (await getCurrentUser()) redirect(next);

    const dict = await getDictionary(lang);
    return (
        <section className="mx-auto max-w-md px-4 py-12 sm:py-16">
            <PageHeader
                title={mode === 'signin' ? dict.auth.signInTitle : dict.auth.signUpTitle}
                subtitle={mode === 'signin' ? dict.auth.signInSubtitle : dict.auth.signUpSubtitle}
            />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <AuthForm
                    key={mode}
                    mode={mode}
                    locale={lang}
                    next={next}
                    dict={dict.auth}
                    initialError={query.error === 'link' ? 'linkExpired' : undefined}
                    googleEnabled={process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true'}
                />
            </div>
        </section>
    );
}
