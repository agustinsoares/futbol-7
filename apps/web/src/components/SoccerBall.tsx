import type { SVGProps } from 'react';

/** Pelota clásica de gajos blancos y negros. Se dibuja centrada en (0, 0) con radio 1. */
export function SoccerBallShape() {
    return (
        <g>
            <circle r="1" fill="#fff" stroke="#1a2233" strokeWidth="0.06" />
            <path d="M0 -0.36 L0.34 -0.11 L0.21 0.29 L-0.21 0.29 L-0.34 -0.11 Z" fill="#1a2233" />
            <path
                d="M0 -0.36 L0 -0.72 M0.34 -0.11 L0.68 -0.22 M0.21 0.29 L0.42 0.58 M-0.21 0.29 L-0.42 0.58 M-0.34 -0.11 L-0.68 -0.22"
                stroke="#1a2233"
                strokeWidth="0.06"
            />
            <path d="M-0.22 -0.97 L0 -0.72 L0.22 -0.97 A1 1 0 0 0 -0.22 -0.97 Z" fill="#1a2233" />
            <path d="M0.9 -0.43 L0.68 -0.22 L0.82 0.08 L0.99 0.1 A1 1 0 0 0 0.9 -0.43 Z" fill="#1a2233" />
            <path d="M0.62 0.78 L0.42 0.58 L0.14 0.72 L0.18 0.98 A1 1 0 0 0 0.62 0.78 Z" fill="#1a2233" />
            <path
                d="M-0.18 0.98 L-0.14 0.72 L-0.42 0.58 L-0.62 0.78 A1 1 0 0 0 -0.18 0.98 Z"
                fill="#1a2233"
            />
            <path d="M-0.99 0.1 L-0.82 0.08 L-0.68 -0.22 L-0.9 -0.43 A1 1 0 0 0 -0.99 0.1 Z" fill="#1a2233" />
        </g>
    );
}

export default function SoccerBall(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="-1.05 -1.05 2.1 2.1" aria-hidden="true" {...props}>
            <SoccerBallShape />
        </svg>
    );
}
