import { NextResponse, type NextRequest } from 'next/server';
import { getDictionary, interpolate } from '@/i18n/dictionaries';
import { escapeHtml, sendEmail } from '@/lib/email';
import { formatMatchDateRange } from '@/lib/format';
import { siteUrl } from '@/lib/site';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

// Tarea diaria (Vercel Cron, ver vercel.json):
// 1. Marca como jugados los partidos ya terminados.
// 2. Envía el recordatorio a los jugadores confirmados de los partidos de las próximas 26 horas.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) return NextResponse.json({ error: 'SUPABASE_SECRET_KEY is not set' }, { status: 500 });

    const { data: completed, error: completeError } = await supabase.rpc('complete_past_matches');
    if (completeError) return NextResponse.json({ error: completeError.message }, { status: 500 });

    const { data: due, error: dueError } = await supabase.rpc('due_reminders');
    if (dueError) return NextResponse.json({ error: dueError.message }, { status: 500 });

    const origin = process.env.NEXT_PUBLIC_SITE_URL ? siteUrl().origin : request.nextUrl.origin;
    const sentIds: string[] = [];
    const failures: string[] = [];
    let notConfigured = 0;

    for (const reminder of due ?? []) {
        const locale = reminder.locale;
        const t = (await getDictionary(locale)).emails;
        const when = formatMatchDateRange(reminder.starts_at, reminder.duration_minutes, locale);
        const url = `${origin}/${locale}/matches/${reminder.match_id}`;
        const vars = {
            name: reminder.full_name || '',
            title: reminder.title,
            when,
            venue: reminder.venue_name,
            address: reminder.venue_address,
        };
        const lines = [
            interpolate(t.reminderGreeting, vars),
            interpolate(t.reminderBody, vars),
            `${t.reminderCantMake} ${url}`,
            t.reminderFooter,
        ];
        const result = await sendEmail({
            to: reminder.email,
            subject: interpolate(t.reminderSubject, vars),
            text: lines.join('\n\n'),
            html: lines
                .map(
                    (line) =>
                        `<p>${escapeHtml(line).replace(escapeHtml(url), `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`)}</p>`,
                )
                .join(''),
        });
        if (result.sent) sentIds.push(reminder.participant_id);
        else if (result.reason === 'not_configured') notConfigured++;
        else failures.push(result.detail ?? 'error');
    }

    if (sentIds.length) {
        const { error } = await supabase.rpc('mark_reminders_sent', { p_participant_ids: sentIds });
        if (error) failures.push(error.message);
    }

    return NextResponse.json({
        completedMatches: completed ?? 0,
        remindersDue: due?.length ?? 0,
        remindersSent: sentIds.length,
        // Sin RESEND_API_KEY no se envía nada y los recordatorios quedan pendientes.
        emailNotConfigured: notConfigured,
        failures,
    });
}
