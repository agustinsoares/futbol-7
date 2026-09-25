import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { SITE_NAME } from '@/lib/site';
import Logo from './Logo';

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-surface">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-charcoal/80 sm:flex-row">
                <Logo locale={locale} label={dict.nav.logoLabel} />
                <p>
                    &copy; {year} {SITE_NAME}. {dict.footer.rights}
                </p>
            </div>
        </footer>
    );
}
