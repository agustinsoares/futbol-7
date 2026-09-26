import { notFound } from 'next/navigation';
import { Alert, PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { requireAdmin } from '@/lib/auth';
import VenueForm from '../VenueForm';

export default async function NewVenuePage({ params }: PageProps<'/[lang]/admin/venues/new'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const [admin, dict] = await Promise.all([
        requireAdmin(lang, `/${lang}/admin/venues/new`),
        getDictionary(lang),
    ]);

    return (
        <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <PageHeader title={dict.admin.newTitle} />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                {admin ? (
                    <VenueForm locale={lang} dict={dict} />
                ) : (
                    <Alert tone="error">{dict.admin.forbidden}</Alert>
                )}
            </div>
        </section>
    );
}
