'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Alert, buttonStyles, inputStyles } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import type { ChatMessage } from '@/lib/match-data';
import { deleteMessageAction, postMessageAction, type SimpleFormState } from './actions';

interface ChatPanelProps {
    locale: Locale;
    matchId: string;
    messages: ChatMessage[];
    currentUserId: string;
    canModerate: boolean;
    timeLabels: Record<string, string>;
    dict: Dictionary['chat'];
}

export default function ChatPanel({
    locale,
    matchId,
    messages,
    currentUserId,
    canModerate,
    timeLabels,
    dict,
}: ChatPanelProps) {
    const [state, action, pending] = useActionState<SimpleFormState, FormData>(postMessageAction, {});

    return (
        <div className="space-y-4">
            {messages.length === 0 ? (
                <p className="text-sm text-charcoal/60">{dict.empty}</p>
            ) : (
                <ol className="max-h-96 space-y-3 overflow-y-auto pr-1" aria-live="polite">
                    {messages.map((message) => {
                        const mine = message.userId === currentUserId;
                        return (
                            <li key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                                        mine ? 'bg-primary-soft' : 'bg-surface'
                                    }`}
                                >
                                    <p className="text-xs text-charcoal/60">
                                        <Link
                                            href={`/${locale}/players/${message.userId}`}
                                            className="font-semibold"
                                        >
                                            {message.name}
                                        </Link>{' '}
                                        · <time dateTime={message.createdAt}>{timeLabels[message.id]}</time>
                                    </p>
                                    <p className="mt-0.5 break-words whitespace-pre-line">{message.body}</p>
                                    {(mine || canModerate) && (
                                        <form action={deleteMessageAction} className="mt-1 text-right">
                                            <input type="hidden" name="lang" value={locale} />
                                            <input type="hidden" name="matchId" value={matchId} />
                                            <input type="hidden" name="messageId" value={message.id} />
                                            <button
                                                type="submit"
                                                className="text-xs text-charcoal/50 hover:text-accent-strong"
                                            >
                                                {dict.delete}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
            {state.error && <Alert tone="error">{dict.errors.generic}</Alert>}
            <form action={action} className="flex gap-2">
                <input type="hidden" name="lang" value={locale} />
                <input type="hidden" name="matchId" value={matchId} />
                <label htmlFor="chat-body" className="sr-only">
                    {dict.placeholder}
                </label>
                <textarea
                    id="chat-body"
                    name="body"
                    rows={1}
                    maxLength={1000}
                    required
                    placeholder={dict.placeholder}
                    className={`${inputStyles} min-h-11 flex-1 resize-y`}
                />
                <button type="submit" disabled={pending} className={`${buttonStyles.primary} self-end`}>
                    {dict.send}
                </button>
            </form>
        </div>
    );
}
