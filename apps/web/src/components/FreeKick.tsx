'use client';

import { useEffect, useRef } from 'react';
import { SoccerBallShape } from './SoccerBall';

interface FreeKickProps {
    title: string;
    caption: string;
    goal: string;
    sceneLabel: string;
}

// Trayectoria del tiro: sale del pie, pasa por encima de la barrera y se mete en el ángulo.
const BALL_PATH = 'M232 392 C 300 120, 620 10, 702 86';
const BALL_START_RADIUS = 13;
const BALL_END_RADIUS = 7;

// Tramos del scroll (0 a 1): carrera y patada, vuelo de la pelota y celebración.
const KICK_END = 0.18;
const FLIGHT_END = 0.82;

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Tiro libre ligado al scroll: la sección mide más que la pantalla y la escena queda fija
 * (sticky) mientras el usuario scrollea; el avance mueve al jugador y la pelota hasta el gol.
 * Con "reducir movimiento" se muestra directamente el gol, sin escena fija.
 */
export default function FreeKick({ title, caption, goal, sceneLabel }: FreeKickProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const ballRef = useRef<SVGGElement>(null);
    const legRef = useRef<SVGGElement>(null);
    const kickerRef = useRef<SVGGElement>(null);
    const netRef = useRef<SVGGElement>(null);
    const goalRef = useRef<HTMLParagraphElement>(null);
    const captionRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const path = pathRef.current;
        if (!section || !path) return;

        const pathLength = path.getTotalLength();
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;

        const render = (progress: number) => {
            const kick = clamp(progress / KICK_END);
            const flight = easeInOut(clamp((progress - KICK_END) / (FLIGHT_END - KICK_END)));
            const celebration = clamp((progress - FLIGHT_END) / (1 - FLIGHT_END));

            // El jugador se acerca a la pelota y echa la pierna atrás antes de golpear.
            kickerRef.current?.setAttribute('transform', `translate(${-40 + kick * 40} 0)`);
            const legAngle = kick < 0.6 ? kick * 70 : 42 - (kick - 0.6) * 230;
            legRef.current?.setAttribute('transform', `rotate(${legAngle} 172 338)`);

            // La pelota recorre la curva, se achica con la distancia y gira.
            const point = path.getPointAtLength(flight * pathLength);
            const radius = BALL_START_RADIUS - (BALL_START_RADIUS - BALL_END_RADIUS) * flight;
            ballRef.current?.setAttribute(
                'transform',
                `translate(${point.x} ${point.y}) rotate(${flight * 900}) scale(${radius})`,
            );

            // La red se infla con el gol y aparece el cartel.
            const bulge = Math.sin(Math.min(celebration * 2, 1) * Math.PI) * 6;
            netRef.current?.setAttribute('transform', `translate(${bulge * 0.4} ${-bulge})`);
            if (goalRef.current) {
                goalRef.current.style.opacity = String(celebration > 0 ? clamp(celebration * 3) : 0);
                goalRef.current.style.transform = `scale(${0.6 + clamp(celebration * 2.5) * 0.4})`;
            }
            if (captionRef.current) captionRef.current.style.opacity = String(1 - clamp(progress * 5));
        };

        const update = () => {
            frame = 0;
            if (reducedMotion.matches) return render(1);
            const rect = section.getBoundingClientRect();
            const scrollable = rect.height - window.innerHeight;
            render(scrollable > 0 ? clamp(-rect.top / scrollable) : 1);
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        reducedMotion.addEventListener('change', onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            reducedMotion.removeEventListener('change', onScroll);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative h-[180vh] bg-primary-strong motion-reduce:h-auto sm:h-[230vh] sm:motion-reduce:h-auto"
        >
            <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-8 motion-reduce:static motion-reduce:h-auto">
                <h2 className="text-center text-3xl font-bold text-white">{title}</h2>
                <p ref={captionRef} className="mt-2 text-center text-white/75 motion-reduce:hidden">
                    {caption}
                </p>
                <div className="relative mt-6 w-full max-w-4xl">
                    <svg
                        viewBox="0 0 800 450"
                        role="img"
                        aria-label={sceneLabel}
                        className="w-full overflow-hidden rounded-2xl shadow-2xl"
                    >
                        <defs>
                            <linearGradient id="fk-sky" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#0b2a66" />
                                <stop offset="1" stopColor="#1d3f8f" />
                            </linearGradient>
                            <pattern id="fk-net" width="12" height="12" patternUnits="userSpaceOnUse">
                                <path
                                    d="M0 0 L12 12 M12 0 L0 12"
                                    stroke="#fff"
                                    strokeOpacity="0.45"
                                    strokeWidth="1"
                                />
                            </pattern>
                        </defs>

                        {/* Cielo, tribuna y césped a rayas */}
                        <rect width="800" height="450" fill="url(#fk-sky)" />
                        <rect y="150" width="800" height="300" fill="#1e8e5a" />
                        {[0, 1, 2, 3, 4].map((i) => (
                            <rect
                                key={i}
                                y={150 + i * 60}
                                width="800"
                                height="30"
                                fill="#166b44"
                                opacity="0.55"
                            />
                        ))}
                        <path
                            d="M0 330 Q 400 300 800 330"
                            stroke="#fff"
                            strokeOpacity="0.5"
                            strokeWidth="3"
                            fill="none"
                        />

                        {/* Arco */}
                        <g ref={netRef}>
                            <rect x="470" y="70" width="250" height="110" fill="url(#fk-net)" />
                        </g>
                        <path
                            d="M466 182 V66 H724 V182"
                            stroke="#fff"
                            strokeWidth="8"
                            fill="none"
                            strokeLinejoin="round"
                        />

                        {/* Barrera */}
                        {[0, 1, 2, 3].map((i) => (
                            <g key={i} transform={`translate(${470 + i * 34} 0)`}>
                                <circle cx="0" cy="208" r="11" fill="#f1c9a5" />
                                <rect x="-14" y="220" width="28" height="44" rx="8" fill="#ba0c2f" />
                                <rect x="-11" y="262" width="9" height="34" rx="4" fill="#1a2233" />
                                <rect x="2" y="262" width="9" height="34" rx="4" fill="#1a2233" />
                            </g>
                        ))}

                        {/* Pateador (camiseta azul) */}
                        <g ref={kickerRef} transform="translate(-40 0)">
                            <circle cx="160" cy="262" r="14" fill="#f1c9a5" />
                            <rect x="142" y="278" width="36" height="58" rx="10" fill="#2f6fe0" />
                            <rect x="148" y="334" width="11" height="52" rx="5" fill="#1a2233" />
                            <g ref={legRef}>
                                <rect x="166" y="334" width="11" height="52" rx="5" fill="#1a2233" />
                                <ellipse cx="176" cy="388" rx="10" ry="5" fill="#fff" />
                            </g>
                        </g>

                        {/* Trayectoria (invisible) y pelota */}
                        <path ref={pathRef} d={BALL_PATH} fill="none" stroke="none" />
                        <ellipse cx="232" cy="404" rx="12" ry="3" fill="#000" opacity="0.25" />
                        <g ref={ballRef} transform={`translate(232 392) scale(${BALL_START_RADIUS})`}>
                            <SoccerBallShape />
                        </g>
                    </svg>
                    <p
                        ref={goalRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-5xl text-white opacity-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-8xl"
                    >
                        {goal}
                    </p>
                </div>
            </div>
        </section>
    );
}
