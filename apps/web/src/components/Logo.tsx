import Link from 'next/link';
import type { Locale } from '@/i18n/config';

interface LogoProps {
    locale: Locale;
    label: string;
    inverted?: boolean;
}

export default function Logo({ locale, label, inverted = false }: LogoProps) {
    return (
        <Link
            href={`/${locale}`}
            className={`font-display text-lg leading-none tracking-wide whitespace-nowrap sm:text-xl ${inverted ? 'text-white' : 'text-charcoal'}`}
            aria-label={label}
        >
            <span className="text-primary">AALTO</span> FOOTBALL
        </Link>
    );
}
