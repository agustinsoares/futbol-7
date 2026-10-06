import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { toRow } = await import('../vercel-analytics');

describe('toRow', () => {
    it('reads the dimension, page views and visitors', () => {
        expect(toRow({ requestPath: '/en', pageviews: 12, visitors: 5 }, 'requestPath')).toEqual({
            key: '/en',
            pageviews: 12,
            visitors: 5,
        });
    });

    it('accepts `count` as page views and tolerates missing fields', () => {
        expect(toRow({ country: 'NO', count: '7' }, 'country')).toEqual({
            key: 'NO',
            pageviews: 7,
            visitors: 0,
        });
        expect(toRow(null, 'day')).toEqual({ key: '', pageviews: 0, visitors: 0 });
    });
});
