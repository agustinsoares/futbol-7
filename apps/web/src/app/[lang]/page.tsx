import Image from 'next/image';
import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import MatchCard from '@/components/MatchCard';
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
import { getDictionary } from '@/i18n/dictionaries';
import { isLocale } from '@/i18n/config';
import { getUpcomingMatches } from '@/lib/matches';
import { notFound } from 'next/navigation';
import heroImage from '../../../public/images/hero.webp';

// Los partidos cambian a lo largo del día: regeneramos la página como mucho cada 5 minutos.
export const revalidate = 300;

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const STEP_ICONS: IconType[] = [SearchIcon, UserPlusIcon, BallIcon];
const HOST_ICONS: IconType[] = [CalendarIcon, UsersIcon, ShareIcon, StarIcon];

function FeatureIcon({ icon: IconComponent }: { icon: IconType }) {
    return (
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
            <IconComponent className="h-6 w-6" />
        </span>
    );
}

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const dict = await getDictionary(lang);
    const { matches, isExample } = await getUpcomingMatches(6);

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
                            {dict.hero.titleStart} <span className="text-primary">{dict.hero.titleEnd}</span>
                        </h1>
                        <p className="mt-5 text-lg text-white/85">{dict.hero.subtitle}</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={`/${lang}/matches`}
                                className="rounded-lg bg-primary-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-primary"
                            >
                                {dict.hero.ctaFind}
                            </Link>
                            <Link
                                href={`/${lang}/matches/new`}
                                className="rounded-lg bg-white px-6 py-3 font-semibold text-primary-strong transition-colors hover:bg-primary-soft"
                            >
                                {dict.hero.ctaHost}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="scroll-mt-16 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="text-3xl font-bold">{dict.howItWorks.title}</h2>
                    <p className="mt-2 text-charcoal/70">{dict.howItWorks.subtitle}</p>
                    <ol className="mt-10 grid gap-8 md:grid-cols-3">
                        {dict.howItWorks.steps.map((step, index) => (
                            <li key={step.title} className="flex gap-4">
                                <FeatureIcon icon={STEP_ICONS[index]} />
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

            {/* Matches */}
            <section id="matches" className="scroll-mt-16 bg-surface py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold">{dict.matches.title}</h2>
                            {isExample && <p className="mt-2 text-charcoal/70">{dict.matches.subtitle}</p>}
                        </div>
                        {isExample && (
                            <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
                                <ClockIcon className="h-4 w-4" />
                                {dict.matches.examplesBadge}
                            </p>
                        )}
                    </div>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {matches.map((match) => (
                            <MatchCard key={match.id} match={match} locale={lang} dict={dict} />
                        ))}
                    </div>
                    {!isExample && (
                        <div className="mt-8 text-center">
                            <Link
                                href={`/${lang}/matches`}
                                className="inline-block rounded-lg border border-black/15 bg-white px-6 py-3 font-semibold transition-colors hover:bg-surface"
                            >
                                {dict.matchList.viewAll}
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Hosts */}
            <section id="hosts" className="scroll-mt-16 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold">{dict.hosts.title}</h2>
                        <p className="mt-2 text-charcoal/70">{dict.hosts.subtitle}</p>
                    </div>
                    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {dict.hosts.features.map((feature, index) => (
                            <li
                                key={feature.title}
                                className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
                            >
                                <FeatureIcon icon={HOST_ICONS[index]} />
                                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                                <p className="mt-1 text-sm text-charcoal/70">{feature.text}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-12 rounded-2xl bg-primary-strong px-6 py-10 text-center text-white sm:px-12">
                        <p className="font-display text-2xl sm:text-3xl">{dict.hosts.bannerTitle}</p>
                        <p className="mx-auto mt-3 max-w-xl text-white/85">{dict.hosts.bannerText}</p>
                        <Link
                            href={`/${lang}/matches/new`}
                            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-primary-strong transition-colors hover:bg-primary-soft"
                        >
                            {dict.hosts.bannerCta}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
