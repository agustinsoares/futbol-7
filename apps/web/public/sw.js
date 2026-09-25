// Service worker de Aalto Football (PWA).
// - Páginas: primero la red; sin conexión, la última versión guardada o la página "offline".
// - Assets con hash de Next, iconos e imágenes: primero la caché.
// Cambia VERSION para invalidar las cachés en el próximo deploy.

const VERSION = 'v1';
const PAGES_CACHE = `pages-${VERSION}`;
const ASSETS_CACHE = `assets-${VERSION}`;
const OFFLINE_PAGES = { en: '/en/offline', nb: '/nb/offline' };

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(PAGES_CACHE)
            .then((cache) => cache.addAll(Object.values(OFFLINE_PAGES)))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== PAGES_CACHE && key !== ASSETS_CACHE)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

function offlinePageFor(url) {
    return url.pathname.startsWith('/nb') ? OFFLINE_PAGES.nb : OFFLINE_PAGES.en;
}

async function networkFirstPage(request) {
    const cache = await caches.open(PAGES_CACHE);
    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
    } catch {
        const cached = await cache.match(request);
        return cached || (await cache.match(offlinePageFor(new URL(request.url)))) || Response.error();
    }
}

async function cacheFirstAsset(request) {
    const cache = await caches.open(ASSETS_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return; // Supabase y otros dominios: sin tocar.

    if (request.mode === 'navigate') {
        event.respondWith(networkFirstPage(request));
        return;
    }

    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.startsWith('/images/')
    ) {
        event.respondWith(cacheFirstAsset(request));
    }
});
