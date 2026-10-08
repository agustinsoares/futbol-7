'use client';

import { useParams } from 'next/navigation';
import BallLoader from '@/components/BallLoader';

// loading.tsx no recibe el diccionario: elegimos el texto según el idioma de la URL.
const LABELS: Record<string, string> = { en: 'Loading…', nb: 'Laster…' };

export default function Loading() {
    const { lang } = useParams<{ lang: string }>();
    return <BallLoader label={LABELS[lang] ?? LABELS.en} />;
}
