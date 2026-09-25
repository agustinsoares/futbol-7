import { TIME_ZONE } from './site';

// Conversión entre la hora "de pared" de Bergen (lo que escribe el host en el formulario)
// y UTC (lo que se guarda en la base). Sin librerías: usamos Intl para conocer el desfase
// de Europe/Oslo en cada instante, que cambia con el horario de verano.

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

interface WallTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}

function wallTimeAt(instant: Date): WallTime & { second: number } {
    const parts = Object.fromEntries(
        partsFormatter.formatToParts(instant).map((p) => [p.type, p.value]),
    ) as Record<string, string>;
    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second),
    };
}

/** Milisegundos que Oslo va por delante de UTC en ese instante (+1 h o +2 h). */
function osloOffsetMs(instant: Date): number {
    const w = wallTimeAt(instant);
    const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
    return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** '2026-10-03' + '18:30' (hora de Bergen) → instante UTC. Devuelve null si el formato no es válido. */
export function osloWallTimeToDate(date: string, time: string): Date | null {
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (!d || !t) return null;
    const [year, month, day, hour, minute] = [d[1], d[2], d[3], t[1], t[2]].map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

    const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);
    // Primera aproximación con el desfase de ese momento, y corrección por si cruza un cambio de hora.
    let result = naiveUtc - osloOffsetMs(new Date(naiveUtc));
    result = naiveUtc - osloOffsetMs(new Date(result));
    const check = wallTimeAt(new Date(result));
    if (check.year !== year || check.month !== month || check.day !== day) return null;
    return new Date(result);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Instante → valores para <input type="date"> y <input type="time"> en hora de Bergen. */
export function dateToOsloInputs(iso: string): { date: string; time: string } {
    const w = wallTimeAt(new Date(iso));
    return { date: `${w.year}-${pad(w.month)}-${pad(w.day)}`, time: `${pad(w.hour)}:${pad(w.minute)}` };
}

/** Fecha de hoy en Bergen como 'YYYY-MM-DD'. */
export function osloToday(now = new Date()): string {
    return dateToOsloInputs(now.toISOString()).date;
}

/** Suma días a una fecha 'YYYY-MM-DD' (aritmética de calendario, sin zonas horarias). */
export function addDays(date: string, days: number): string {
    const [y, m, d] = date.split('-').map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + days));
    return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/** Día de la semana (0 = domingo) de una fecha 'YYYY-MM-DD'. */
export function weekday(date: string): number {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Inicio del día (00:00 en Bergen) de una fecha 'YYYY-MM-DD', en UTC. */
export function osloStartOfDay(date: string): Date {
    return osloWallTimeToDate(date, '00:00')!;
}
