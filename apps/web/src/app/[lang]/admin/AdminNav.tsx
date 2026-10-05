'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export default function AdminNav({
    locale,
    dict,
}: {
    locale: Locale;
    dict: Dictionary['adminPanel']['nav'];
}) {
    const pathname = usePathname();
    const base = `/${locale}/admin`;
    const tabs = [
        { href: base, label: dict.overview, active: pathname === base },
        { href: `${base}/users`, label: dict.users, active: pathname.startsWith(`${base}/users`) },
        { href: `${base}/venues`, label: dict.pitches, active: pathname.startsWith(`${base}/venues`) },
    ];
    return (
        <nav aria-label="Admin" className="mx-auto max-w-6xl px-4 pt-8">
            <ul className="flex gap-1 overflow-x-auto rounded-lg bg-surface p-1 text-sm font-semibold sm:inline-flex">
                {tabs.map((tab) => (
                    <li key={tab.href}>
                        <Link
                            href={tab.href}
                            aria-current={tab.active ? 'page' : undefined}
                            className={`block rounded-md px-3 py-1.5 whitespace-nowrap ${
                                tab.active ? 'bg-white shadow-sm' : 'text-charcoal/70 hover:text-charcoal'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
