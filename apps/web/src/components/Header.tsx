import Link from 'next/link';
import Logo from './Logo';

const NAV_LINKS = [
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/#partidos', label: 'Partidos' },
    { href: '/#hosts', label: 'Para hosts' },
];

export default function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-black/10 bg-charcoal text-white">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
                <Logo inverted />
                <nav aria-label="Principal" className="hidden md:block">
                    <ul className="flex items-center gap-6 text-sm font-medium">
                        {NAV_LINKS.map((link) => (
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
                <Link
                    href="/#hosts"
                    className="rounded-lg bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary"
                >
                    Crear partido
                </Link>
            </div>
        </header>
    );
}
