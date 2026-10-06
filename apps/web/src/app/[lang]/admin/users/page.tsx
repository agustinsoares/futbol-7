import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Alert, buttonStyles, Input, PageHeader } from '@/components/ui';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary, interpolate } from '@/i18n/dictionaries';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { setRoleAction } from './actions';

export async function generateMetadata({ params }: PageProps<'/[lang]/admin/users'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return { title: dict.adminPanel.usersTitle, robots: { index: false } };
}

function formatDay(iso: string, locale: Locale) {
    return new Intl.DateTimeFormat(locale === 'nb' ? 'nb-NO' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Oslo',
    }).format(new Date(iso));
}

export default async function AdminUsersPage({ params, searchParams }: PageProps<'/[lang]/admin/users'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const query = await searchParams;
    const q = typeof query.q === 'string' ? query.q.slice(0, 100) : '';
    const [admin, dict] = await Promise.all([
        requireAdmin(lang, `/${lang}/admin/users`),
        getDictionary(lang),
    ]);
    const t = dict.adminPanel;
    if (!admin) {
        return (
            <section className="mx-auto max-w-xl px-4 py-16">
                <Alert tone="error">{t.forbidden}</Alert>
            </section>
        );
    }

    const supabase = await createSupabaseServerClient();
    const { data: users, error } = await supabase.rpc('admin_list_users', { p_search: q });

    return (
        <section className="mx-auto max-w-4xl px-4 py-12">
            <PageHeader title={t.usersTitle} subtitle={t.usersSubtitle} />
            <form method="get" className="mt-8 flex gap-3" role="search">
                <label htmlFor="q" className="sr-only">
                    {t.search}
                </label>
                <Input id="q" name="q" type="search" defaultValue={q} placeholder={t.search} />
                <button type="submit" className={buttonStyles.secondary}>
                    {t.searchButton}
                </button>
            </form>
            {(query.error === '1' || error) && (
                <div className="mt-4">
                    <Alert tone="error">{t.roleError}</Alert>
                </div>
            )}
            {users && users.length === 0 && <p className="mt-8 text-ink/70">{t.noResults}</p>}
            {users && users.length > 0 && (
                <ul className="mt-6 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
                    {users.map((user) => {
                        const isSelf = user.id === admin.id;
                        const isAdmin = user.role === 'admin';
                        return (
                            <li
                                key={user.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold">
                                        {user.full_name || user.email}
                                        {isSelf && (
                                            <span className="font-normal text-ink/60"> ({t.you})</span>
                                        )}
                                        {isAdmin && (
                                            <span className="ml-2 rounded-md bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-strong">
                                                {t.admin}
                                            </span>
                                        )}
                                    </p>
                                    <p className="truncate text-sm text-ink/60">
                                        {user.email} ·{' '}
                                        {user.last_sign_in_at
                                            ? interpolate(t.lastSeen, {
                                                  date: formatDay(user.last_sign_in_at, lang),
                                              })
                                            : t.neverSeen}
                                    </p>
                                </div>
                                {!isSelf && (
                                    <form action={setRoleAction}>
                                        <input type="hidden" name="lang" value={lang} />
                                        <input type="hidden" name="userId" value={user.id} />
                                        <input type="hidden" name="q" value={q} />
                                        <input type="hidden" name="role" value={isAdmin ? 'user' : 'admin'} />
                                        <button
                                            type="submit"
                                            className={isAdmin ? buttonStyles.danger : buttonStyles.secondary}
                                        >
                                            {isAdmin ? t.removeAdmin : t.makeAdmin}
                                        </button>
                                    </form>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
