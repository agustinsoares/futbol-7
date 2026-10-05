import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert, buttonStyles, PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurrentUser } from '@/lib/auth';
import ResetForm from './ResetForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/reset-password'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.password.resetTitle, robots: { index: false } };
}

/** Se llega desde el email de recuperación (que abre sesión) o desde el perfil para cambiar la contraseña. */
export default async function ResetPasswordPage({ params }: PageProps<'/[lang]/reset-password'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const [dict, user] = await Promise.all([getDictionary(lang), getCurrentUser()]);
    const t = dict.password;

    return (
        <section className="mx-auto max-w-md px-4 py-12 sm:py-16">
            <PageHeader title={t.resetTitle} subtitle={user ? t.resetSubtitle : undefined} />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                {user ? (
                    <ResetForm locale={lang} dict={t} authDict={dict.auth} />
                ) : (
                    <div className="space-y-6">
                        <Alert tone="info">{t.needsLink}</Alert>
                        <Link href={`/${lang}/forgot-password`} className={`${buttonStyles.primary} w-full`}>
                            {t.requestNew}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
