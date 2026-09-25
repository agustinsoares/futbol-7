import Logo from './Logo';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-surface">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-charcoal/80 sm:flex-row">
                <Logo />
                <p>&copy; {year} Aalto Football. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
