import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurrentUser } from '@/lib/auth';
import AdminNav from './AdminNav';

// Cada página comprueba el permiso por su cuenta (requireAdmin); aquí solo se añade la navegación.
export default async function AdminLayout({ children, params }: LayoutProps<'/[lang]/admin'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const [user, dict] = await Promise.all([getCurrentUser(), getDictionary(lang)]);
    return (
        <>
            {user?.profile?.role === 'admin' && <AdminNav locale={lang} dict={dict.adminPanel.nav} />}
            {children}
        </>
    );
}
