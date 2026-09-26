import { notFound } from 'next/navigation';
import { Alert, PageHeader } from '@/components/ui';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import VenueForm from '../VenueForm';

export default async function EditVenuePage({ params }: PageProps<'/[lang]/admin/venues/[id]'>) {
    const { lang, id } = await params;
    if (!isLocale(lang)) notFound();
    const [admin, dict] = await Promise.all([
        requireAdmin(lang, `/${lang}/admin/venues/${id}`),
        getDictionary(lang),
    ]);
    if (!admin) {
        return (
            <section className="mx-auto max-w-xl px-4 py-16">
                <Alert tone="error">{dict.admin.forbidden}</Alert>
            </section>
        );
    }

    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const supabase = await createSupabaseServerClient();
    const { data: venue } = await supabase.from('venues').select('*').eq('id', id).maybeSingle();
    if (!venue) notFound();

    return (
        <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <PageHeader title={dict.admin.editTitle} subtitle={venue.name} />
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <VenueForm locale={lang} venue={venue} dict={dict} />
            </div>
        </section>
    );
}
