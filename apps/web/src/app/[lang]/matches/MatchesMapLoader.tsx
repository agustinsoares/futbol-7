'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type MatchesMapType from './MatchesMap';

// Leaflet usa window: se carga solo en el navegador.
const MatchesMap = dynamic(() => import('./MatchesMap'), {
    ssr: false,
    loading: () => <div className="h-[60vh] min-h-96 w-full animate-pulse rounded-2xl bg-surface" />,
});

export default function MatchesMapLoader(props: ComponentProps<typeof MatchesMapType>) {
    return <MatchesMap {...props} />;
}
