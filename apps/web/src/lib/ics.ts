// Genera un archivo iCalendar (RFC 5545) con un solo evento.

export interface IcsEvent {
    uid: string;
    start: Date;
    end: Date;
    summary: string;
    location: string;
    description: string;
    url: string;
    geo?: { lat: number; lng: number };
    cancelled?: boolean;
}

function formatUtc(date: Date): string {
    return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
}

function escapeText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Las líneas de más de 75 octetos se parten con CRLF + espacio. */
function fold(line: string): string {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    const chunks: string[] = [];
    let current = '';
    let size = 0;
    for (const char of line) {
        const charSize = new TextEncoder().encode(char).length;
        if (size + charSize > (chunks.length ? 74 : 75)) {
            chunks.push(current);
            current = '';
            size = 0;
        }
        current += char;
        size += charSize;
    }
    chunks.push(current);
    return chunks.join('\r\n ');
}

export function buildIcs(event: IcsEvent, now = new Date()): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Aalto Football//Matches//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTAMP:${formatUtc(now)}`,
        `DTSTART:${formatUtc(event.start)}`,
        `DTEND:${formatUtc(event.end)}`,
        `SUMMARY:${escapeText(event.summary)}`,
        `LOCATION:${escapeText(event.location)}`,
        `DESCRIPTION:${escapeText(event.description)}`,
        `URL:${event.url}`,
        ...(event.geo ? [`GEO:${event.geo.lat};${event.geo.lng}`] : []),
        `STATUS:${event.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-PT2H',
        `DESCRIPTION:${escapeText(event.summary)}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ];
    return lines.map(fold).join('\r\n') + '\r\n';
}
