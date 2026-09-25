import type { MetadataRoute } from 'next';
import { BRAND_BLUE, SITE_NAME } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/',
        name: SITE_NAME,
        short_name: 'Aalto',
        description: 'Pick-up football in Bergen. Find a match or host your own.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: BRAND_BLUE,
        lang: 'en',
        categories: ['sports', 'social'],
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}
