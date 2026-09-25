'use client';

import { useState, useSyncExternalStore } from 'react';
import { buttonStyles } from '@/components/ui';
import type { Dictionary } from '@/i18n/dictionaries';

interface ShareButtonsProps {
    url: string;
    title: string;
    text: string;
    dict: Pick<Dictionary['match'], 'share' | 'copyLink' | 'copied' | 'shareWhatsApp'>;
}

export default function ShareButtons({ url, title, text, dict }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    // En el servidor no existe navigator: false ahí y el valor real tras hidratar.
    const canShare = useSyncExternalStore(
        () => () => {},
        () => typeof navigator.share === 'function',
        () => false,
    );

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            window.prompt(dict.copyLink, url);
        }
    }

    async function share() {
        try {
            await navigator.share({ title, text, url });
        } catch {
            // El usuario cerró el diálogo: no hacemos nada.
        }
    }

    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    const small = 'px-3 py-2 text-sm';

    return (
        <div className="flex flex-wrap gap-2">
            {canShare && (
                <button type="button" onClick={share} className={`${buttonStyles.secondary} ${small}`}>
                    {dict.share}
                </button>
            )}
            <button
                type="button"
                onClick={copy}
                className={`${buttonStyles.secondary} ${small}`}
                aria-live="polite"
            >
                {copied ? dict.copied : dict.copyLink}
            </button>
            <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonStyles.secondary} ${small}`}
            >
                {dict.shareWhatsApp}
            </a>
        </div>
    );
}
