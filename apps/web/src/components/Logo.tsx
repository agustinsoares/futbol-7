import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';

interface LogoProps {
    locale: Locale;
    label: string;
    inverted?: boolean;
}

/** Logo Fjell-A (ver docs/marca.md) + nombre. "inverted" para fondos oscuros (cabecera azul). */
export default function Logo({ locale, label, inverted = false }: LogoProps) {
    return (
        <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 font-display text-lg leading-none tracking-wide whitespace-nowrap sm:text-xl"
            aria-label={label}
        >
            <Image
                src="/brand/logo.svg"
                alt=""
                width={36}
                height={36}
                unoptimized
                priority
                className="h-9 w-9"
            />
            <span className={inverted ? 'text-white' : 'text-primary-strong'}>
                AALTO <span className={inverted ? 'text-white/75' : 'text-ink/70'}>FOOTBALL</span>
            </span>
        </Link>
    );
}
