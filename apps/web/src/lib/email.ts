import 'server-only';
import { siteUrl } from './site';

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

export interface EmailLayout {
    lang: string;
    heading: string;
    paragraphs: string[];
    button?: { label: string; url: string };
    /** Texto pequeño bajo el botón. */
    note?: string;
    tagline: string;
}

/**
 * HTML de email con la marca (mismo diseño que las plantillas de Supabase en supabase/templates).
 * Todo el texto se escapa; solo usa tablas y estilos en línea para que se vea bien en cualquier cliente.
 */
export function renderEmailHtml({ lang, heading, paragraphs, button, note, tagline }: EmailLayout): string {
    const p = (text: string) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(text)}</p>`;
    const cta = button
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 0;"><tr><td style="border-radius:8px;background:#ba0c2f;">` +
          `<a href="${escapeHtml(button.url)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(button.label)}</a>` +
          `</td></tr></table>`
        : '';
    const small = note
        ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#666666;">${escapeHtml(note)}</p>`
        : '';
    return `<!doctype html>
<html lang="${escapeHtml(lang)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Aalto Football</title></head>
<body style="margin:0;padding:0;background:#f3f5f8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#1a2233;">
<tr><td style="background:#00205b;padding:18px 32px;border-bottom:4px solid #ba0c2f;"><img src="${escapeHtml(siteUrl().origin)}/icons/icon-192.png" width="36" height="36" alt="" style="vertical-align:middle;border:0;margin-right:10px;"><span style="vertical-align:middle;font-size:20px;font-weight:bold;letter-spacing:2px;color:#ffffff;">AALTO <span style="color:#c9d3ea;">FOOTBALL</span></span></td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#1a2233;">${escapeHtml(heading)}</h1>
${paragraphs.map(p).join('\n')}
${cta}
${small}
</td></tr>
<tr><td style="padding:20px 32px;background:#f3f5f8;font-size:12px;line-height:1.5;color:#888888;">Aalto Football · ${escapeHtml(tagline)}</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}
