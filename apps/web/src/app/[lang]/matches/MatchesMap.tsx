'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

export interface MapVenue {
    id: string;
    name: string;
    lat: number;
    lng: number;
    matches: { id: string; title: string; when: string; spots: string }[];
}

interface MatchesMapProps {
    venues: MapVenue[];
    locale: string;
    title: string;
    openLabel: string;
}

const BERGEN: L.LatLngExpression = [60.3913, 5.3221];

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Mapa de canchas con partidos (Leaflet + teselas de OpenStreetMap). Solo cliente. */
export default function MatchesMap({ venues, locale, title, openLabel }: MatchesMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(BERGEN, 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const bounds: L.LatLngTuple[] = [];
        for (const venue of venues) {
            const icon = L.divIcon({
                className: '',
                html: `<span class="map-pin">${venue.matches.length}</span>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });
            const items = venue.matches
                .map(
                    (m) =>
                        `<li><a href="/${locale}/matches/${m.id}"><strong>${escapeHtml(m.title)}</strong></a><br>${escapeHtml(
                            m.when,
                        )} · ${escapeHtml(m.spots)}</li>`,
                )
                .join('');
            L.marker([venue.lat, venue.lng], { icon, title: venue.name, alt: venue.name })
                .addTo(map)
                .bindPopup(
                    `<p class="map-popup-title">${escapeHtml(venue.name)}</p><ul class="map-popup-list">${items}</ul>`,
                );
            bounds.push([venue.lat, venue.lng]);
        }
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        else if (bounds.length === 1) map.setView(bounds[0], 14);

        return () => {
            map.remove();
        };
    }, [venues, locale, openLabel]);

    return (
        <div
            ref={containerRef}
            role="region"
            aria-label={title}
            className="relative z-0 h-[60vh] min-h-96 w-full rounded-2xl border border-black/10"
        />
    );
}
