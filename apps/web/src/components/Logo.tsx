import Link from 'next/link';

export default function Logo({ inverted = false }: { inverted?: boolean }) {
    return (
        <Link
            href="/"
            className={`font-display text-xl leading-none tracking-wide ${inverted ? 'text-white' : 'text-charcoal'}`}
            aria-label="Aalto Football, ir al inicio"
        >
            <span className="text-primary">AALTO</span> FOOTBALL
        </Link>
    );
}
