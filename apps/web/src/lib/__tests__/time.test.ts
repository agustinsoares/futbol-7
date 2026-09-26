import { describe, expect, it } from 'vitest';
import { addDays, dateToOsloInputs, osloToday, osloWallTimeToDate, weekday } from '../time';

describe('hora de Bergen', () => {
    it.each([
        ['2026-07-01', '18:30', '2026-07-01T16:30:00.000Z'],
        ['2026-12-01', '18:30', '2026-12-01T17:30:00.000Z'],
        ['2026-10-25', '01:30', '2026-10-24T23:30:00.000Z'],
        ['2026-10-25', '12:00', '2026-10-25T11:00:00.000Z'],
        ['2026-03-29', '12:00', '2026-03-29T10:00:00.000Z'],
    ])('%s %s en Bergen es %s', (date, time, expected) => {
        expect(osloWallTimeToDate(date, time)?.toISOString()).toBe(expected);
    });

    it('rechaza fechas inválidas', () => {
        expect(osloWallTimeToDate('2026-02-30', '10:00')).toBeNull();
        expect(osloWallTimeToDate('x', '10:00')).toBeNull();
    });

    it('convierte de vuelta a los valores del formulario', () => {
        expect(dateToOsloInputs('2026-12-01T17:30:00.000Z')).toEqual({ date: '2026-12-01', time: '18:30' });
    });

    it('calcula el día en Bergen y aritmética de fechas', () => {
        expect(osloToday(new Date('2026-09-25T23:30:00Z'))).toBe('2026-09-26');
        expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
        expect(weekday('2026-09-26')).toBe(6);
    });
});
