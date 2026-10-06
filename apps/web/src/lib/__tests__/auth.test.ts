import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('../supabase/server', () => ({}));
const { safeNextPath } = await import('../auth');

describe('safeNextPath', () => {
    it('keeps internal paths, query and hash', () => {
        expect(safeNextPath('/en/matches/abc?x=1#chat', 'en')).toBe('/en/matches/abc?x=1#chat');
    });

    it.each([
        null,
        '',
        'https://evil.com',
        '//evil.com',
        '/\\evil.com',
        '/\t/evil.com',
        '/\n/evil.com',
        'javascript:alert(1)',
        '/%09/evil.com/../',
    ])('falls back for %j', (next) => {
        const result = safeNextPath(next, 'nb');
        expect(new URL(result, 'https://aaltofootball.vercel.app').origin).toBe(
            'https://aaltofootball.vercel.app',
        );
    });

    it('uses the matches page as fallback', () => {
        expect(safeNextPath('//evil.com', 'nb')).toBe('/nb/matches');
    });
});
