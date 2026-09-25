import Image from 'next/image';
import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import MatchCard, { type MatchCardProps } from '@/components/MatchCard';
import {
    BallIcon,
    CalendarIcon,
    ClockIcon,
    SearchIcon,
    ShareIcon,
    StarIcon,
    UserPlusIcon,
    UsersIcon,
} from '@/components/icons';
import heroImage from '../../public/images/hero.webp';

// Las fechas de los partidos de ejemplo son relativas a hoy: regeneramos la página a diario.
export const revalidate = 86400;

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const STEPS: { icon: IconType; title: string; text: string }[] = [
    {
        icon: SearchIcon,
        title: 'Busca un partido',
        text: 'Filtra por día, zona y nivel y mira cuántas plazas quedan libres.',
    },
    {
        icon: UserPlusIcon,
        title: 'Súmate en un toque',
        text: 'Reserva tu plaza. Si está completo, entras en la lista de espera.',
    },
    {
        icon: BallIcon,
        title: 'A jugar',
        text: 'Te recordamos el partido y la dirección de la cancha. Solo falta llegar.',
    },
];

const HOST_FEATURES: { icon: IconType; title: string; text: string }[] = [
    {
        icon: CalendarIcon,
        title: 'Crea partidos en segundos',
        text: 'Cancha, hora, formato, nivel y número de plazas. Listo.',
    },
    {
        icon: UsersIcon,
        title: 'Lista de jugadores al día',
        text: 'Quién va, quién se bajó y quién espera, sin perseguir a nadie por el grupo.',
    },
    {
        icon: ShareIcon,
        title: 'Comparte por WhatsApp',
        text: 'Un enlace por partido para llenar las plazas que faltan.',
    },
    {
        icon: StarIcon,
        title: 'Jugadores de confianza',
        text: 'Valoraciones y asistencia para saber con quién juegas.',
    },
];

function daysFromNow(days: number, hour: number, minute = 0): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    date.setUTCHours(hour, minute, 0, 0);
    return date.toISOString();
}

// Datos de ejemplo hasta que exista el listado real de partidos.
const EXAMPLE_MATCHES: MatchCardProps[] = [
    {
        venue: 'Polideportivo La Elipa',
        area: 'Madrid · Moratalaz',
        startsAt: daysFromNow(1, 18, 30),
        format: 'F7',
        level: 'Intermedio',
        spotsTotal: 14,
        spotsTaken: 12,
        pricePerPlayer: 6,
    },
    {
        venue: 'Campo Municipal Vallehermoso',
        area: 'Madrid · Chamberí',
        startsAt: daysFromNow(2, 19),
        format: 'F7',
        level: 'Iniciación',
        spotsTotal: 14,
        spotsTaken: 7,
        pricePerPlayer: 5,
    },
    {
        venue: 'Club Deportivo Orcasitas',
        area: 'Madrid · Usera',
        startsAt: daysFromNow(3, 20),
        format: 'F7',
        level: 'Avanzado',
        spotsTotal: 14,
        spotsTaken: 14,
        pricePerPlayer: 7,
    },
];

function FeatureIcon({ icon: IconComponent }: { icon: IconType }) {
    return (
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
            <IconComponent className="h-6 w-6" />
        </span>
    );
}

export default function HomePage() {
    return (
        <>
            {/* Hero */}
            <section className="relative isolate overflow-hidden bg-charcoal">
                <Image
                    src={heroImage}
                    alt=""
                    fill
                    priority
                    placeholder="blur"
                    sizes="100vw"
                    className="-z-10 object-cover object-[70%_center]"
                />
                <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/80 via-black/60 to-black/20" />
                <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
                    <div className="max-w-xl text-white">
                        <h1 className="text-4xl leading-tight sm:text-5xl">
                            Encuentra partido. <span className="text-primary">O arma el tuyo.</span>
                        </h1>
                        <p className="mt-5 text-lg text-white/85">
                            Partidos de fútbol 5, 7 y 11 cerca de ti. Los hosts crean el partido, tú te sumas y
                            completáis el equipo en minutos.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="#partidos"
                                className="rounded-lg bg-primary-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-primary"
                            >
                                Buscar partidos
                            </Link>
                            <Link
                                href="#hosts"
                                className="rounded-lg bg-white px-6 py-3 font-semibold text-primary-strong transition-colors hover:bg-primary-soft"
                            >
                                Crear un partido
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cómo funciona */}
            <section id="como-funciona" className="scroll-mt-16 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="text-3xl font-bold">Cómo funciona</h2>
                    <p className="mt-2 text-charcoal/70">Tres pasos entre tú y la cancha.</p>
                    <ol className="mt-10 grid gap-8 md:grid-cols-3">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="flex gap-4">
                                <FeatureIcon icon={step.icon} />
                                <div>
                                    <h3 className="font-semibold">
                                        <span className="text-primary-strong">{index + 1}.</span> {step.title}
                                    </h3>
                                    <p className="mt-1 text-charcoal/70">{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Partidos */}
            <section id="partidos" className="scroll-mt-16 bg-surface py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold">Próximos partidos</h2>
                            <p className="mt-2 text-charcoal/70">
                                Así se verán los partidos abiertos de tu zona.
                            </p>
                        </div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
                            <ClockIcon className="h-4 w-4" />
                            Ejemplos · el buscador llega pronto
                        </p>
                    </div>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {EXAMPLE_MATCHES.map((match) => (
                            <MatchCard key={match.venue} {...match} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Hosts */}
            <section id="hosts" className="scroll-mt-16 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold">¿Organizas partidos?</h2>
                        <p className="mt-2 text-charcoal/70">
                            Deja de llenar plazas a mano en el grupo. Publica el partido y deja que los jugadores se
                            apunten solos.
                        </p>
                    </div>
                    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {HOST_FEATURES.map((feature) => (
                            <li key={feature.title} className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
                                <FeatureIcon icon={feature.icon} />
                                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                                <p className="mt-1 text-sm text-charcoal/70">{feature.text}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-12 rounded-2xl bg-primary-strong px-6 py-10 text-center text-white sm:px-12">
                        <p className="font-display text-2xl sm:text-3xl">Muy pronto podrás crear tu primer partido</p>
                        <p className="mx-auto mt-3 max-w-xl text-white/85">
                            Estamos terminando las cuentas de usuario y la creación de partidos.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
