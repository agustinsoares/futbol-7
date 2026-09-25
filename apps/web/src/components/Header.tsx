import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary['nav'] }) {
    const links = [
        { href: `/${locale}#how-it-works`, label: dict.howItWorks },
        { href: `/${locale}#matches`, label: dict.matches },
        { href: `/${locale}#hosts`, label: dict.hosts },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-black/10 bg-charcoal text-white">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                <Logo locale={locale} label={dict.logoLabel} inverted />
                <nav aria-label={dict.label} className="hidden md:block">
                    <ul className="flex items-center gap-6 text-sm font-medium">
                        {links.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="border-b-2 border-transparent pb-1 transition-colors hover:border-accent"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher current={locale} label={dict.languageLabel} />
                    <Link
                        href={`/${locale}#hosts`}
                        className="hidden rounded-lg bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary sm:inline-block"
                    >
                        {dict.createMatch}
                    </Link>
                </div>
            </div>
        </header>
    );
}
