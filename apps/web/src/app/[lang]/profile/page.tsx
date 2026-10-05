import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert, buttonStyles, PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { requireUser, safeNextPath } from '@/lib/auth';
import DeleteAccount from './DeleteAccount';
import ProfileForm from './ProfileForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/profile'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.profile.title, robots: { index: false } };
}

export default async function ProfilePage({ params, searchParams }: PageProps<'/[lang]/profile'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const query = await searchParams;
    const user = await requireUser(lang, `/${lang}/profile`);
    const dict = await getDictionary(lang);
    const welcome = query.welcome === '1';
    const next = welcome && typeof query.next === 'string' ? safeNextPath(query.next, lang) : null;

    return (
        <section className="mx-auto max-w-xl px-4 py-12 sm:py-16">
            <PageHeader
                title={welcome ? dict.profile.welcomeTitle : dict.profile.title}
                subtitle={welcome ? dict.profile.welcomeText : undefined}
            />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                {user.profile ? (
                    <ProfileForm
                        locale={lang}
                        profile={user.profile}
                        email={user.email}
                        next={next}
                        initiallySaved={query.saved === '1'}
                        dict={dict}
                    />
                ) : (
                    <Alert tone="error">{dict.profile.errors.generic}</Alert>
                )}
            </div>
            {!welcome && (
                <p className="mt-6 text-center text-sm">
                    <Link href={`/${lang}/reset-password`} className={buttonStyles.link}>
                        {dict.password.change}
                    </Link>
                </p>
            )}
            {!welcome && (
                <div className="mt-10">
                    <DeleteAccount locale={lang} dict={dict.account} />
                </div>
            )}
        </section>
    );
}
