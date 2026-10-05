import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { renderEmailHtml } = await import('../email');

describe('renderEmailHtml', () => {
    it('escapes every piece of text and the button URL', () => {
        const html = renderEmailHtml({
            lang: 'en',
            heading: 'Hi <b>Ola</b>,',
            paragraphs: ['Tom & Jerry'],
            button: { label: 'Open', url: 'https://example.com/?a=1&b="x"' },
            tagline: 'Pick-up football in Bergen',
        });
        expect(html).not.toContain('<b>Ola</b>');
        expect(html).toContain('Hi &#60;b&#62;Ola&#60;/b&#62;,');
        expect(html).toContain('Tom &#38; Jerry');
        expect(html).toContain('href="https://example.com/?a=1&#38;b=&#34;x&#34;"');
    });

    it('leaves out the button and note when not given', () => {
        const html = renderEmailHtml({ lang: 'nb', heading: 'Hei', paragraphs: [], tagline: 't' });
        expect(html).toContain('<html lang="nb">');
        expect(html).not.toContain('<a ');
    });
});
