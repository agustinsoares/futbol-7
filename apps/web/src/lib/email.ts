import 'server-only';

export interface Email {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export type SendResult =
    { sent: true } | { sent: false; reason: 'not_configured' | 'error'; detail?: string };

/** Envía un email con Resend (https://resend.com). Sin RESEND_API_KEY no envía nada. */
export async function sendEmail(email: Email): Promise<SendResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? 'Aalto Football <onboarding@resend.dev>';
    if (!apiKey) return { sent: false, reason: 'not_configured' };

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from,
            to: [email.to],
            subject: email.subject,
            text: email.text,
            html: email.html,
        }),
    });
    if (!response.ok)
        return { sent: false, reason: 'error', detail: `${response.status} ${await response.text()}` };
    return { sent: true };
}

export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
