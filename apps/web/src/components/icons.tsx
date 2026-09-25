import type { SVGProps } from 'react';

// Iconos de línea al estilo Lucide (recomendado en la guía de marca), inline para no sumar dependencias.
function Icon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        />
    );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </Icon>
    );
}

export function UserPlusIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
        </Icon>
    );
}

export function BallIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="m12 7 4 3-1.5 5h-5L8 10z" />
            <path d="M12 7V2M16 10l5-1.5M14.5 15l3 4.5M9.5 15l-3 4.5M8 10 3 8.5" />
        </Icon>
    );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </Icon>
    );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </Icon>
    );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </Icon>
    );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </Icon>
    );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1z" />
        </Icon>
    );
}
