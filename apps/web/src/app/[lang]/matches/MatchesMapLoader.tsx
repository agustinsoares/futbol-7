'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import BallLoader from '@/components/BallLoader';
import type MatchesMapType from './MatchesMap';

const LOADING_LABELS: Record<string, string> = { en: 'Loading map…', nb: 'Laster kart…' };

function MapLoading() {
    const { lang } = useParams<{ lang: string }>();
    return (
        <BallLoader
            label={LOADING_LABELS[lang] ?? LOADING_LABELS.en}
            className="h-[60vh] min-h-96 w-full rounded-2xl bg-surface"
        />
    );
}

// Leaflet usa window: se carga solo en el navegador.
const MatchesMap = dynamic(() => import('./MatchesMap'), {
    ssr: false,
    loading: MapLoading,
});

export default function MatchesMapLoader(props: ComponentProps<typeof MatchesMapType>) {
    return <MatchesMap {...props} />;
}
