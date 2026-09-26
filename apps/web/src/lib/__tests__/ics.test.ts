import { describe, expect, it } from 'vitest';
import { buildIcs } from '../ics';

describe('buildIcs', () => {
    const ics = buildIcs(
        {
            uid: 'abc@aalto',
            start: new Date('2026-10-03T10:00:00Z'),
            end: new Date('2026-10-03T11:00:00Z'),
            summary: 'Match, with; commas',
            location: 'Frescohallen, Fana',
            description: 'Line 1\nLine 2 ' + 'x'.repeat(120),
            url: 'https://example.com/en/matches/abc',
        },
        new Date('2026-09-26T00:00:00Z'),
    );

    it('usa CRLF y fechas UTC', () => {
        expect(ics).toContain('\r\nDTSTART:20261003T100000Z\r\n');
        expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    });

    it('escapa comas, punto y coma y saltos de línea', () => {
        expect(ics).toContain(String.raw`SUMMARY:Match\, with\; commas`);
        expect(ics).toContain('Line 1\\nLine 2');
    });

    it('parte las líneas largas a 75 octetos', () => {
        for (const line of ics.split('\r\n'))
            expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    });
});
