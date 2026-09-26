import { describe, expect, it } from 'vitest';
import { balanceTeams, type TeamPlayer } from '../teams';

const p = (id: string, level: TeamPlayer['level'], position: TeamPlayer['position'] = 'any'): TeamPlayer => ({
    id,
    level,
    position,
});

describe('balanceTeams', () => {
    it('reparte a todos una sola vez y con tamaños que difieren como mucho en 1', () => {
        const players = Array.from({ length: 11 }, (_, i) =>
            p(`p${i}`, (['beginner', 'intermediate', 'advanced'] as const)[i % 3]),
        );
        const { a, b } = balanceTeams(players);
        expect([...a, ...b].sort()).toEqual(players.map((x) => x.id).sort());
        expect(Math.abs(a.length - b.length)).toBeLessThanOrEqual(1);
    });

    it('deja los equipos parejos en fuerza', () => {
        const players = [
            p('a1', 'advanced'),
            p('a2', 'advanced'),
            p('a3', 'advanced'),
            p('a4', 'advanced'),
            p('b1', 'beginner'),
            p('b2', 'beginner'),
            p('b3', 'beginner'),
            p('b4', 'beginner'),
            p('i1', 'intermediate'),
            p('i2', 'intermediate'),
        ];
        const { strengthA, strengthB } = balanceTeams(players);
        expect(Math.abs(strengthA - strengthB)).toBeLessThanOrEqual(1);
    });

    it('pone un arquero en cada equipo', () => {
        const players = [
            p('gk1', 'advanced', 'goalkeeper'),
            p('gk2', 'beginner', 'goalkeeper'),
            ...Array.from({ length: 8 }, (_, i) => p(`f${i}`, 'intermediate')),
        ];
        const { a, b } = balanceTeams(players);
        expect(a.filter((id) => id.startsWith('gk'))).toHaveLength(1);
        expect(b.filter((id) => id.startsWith('gk'))).toHaveLength(1);
    });

    it('trata el nivel desconocido como intermedio y funciona con 0 y 1 jugadores', () => {
        expect(balanceTeams([])).toEqual({ a: [], b: [], strengthA: 0, strengthB: 0 });
        expect(balanceTeams([p('x', null)]).strengthA + balanceTeams([p('x', null)]).strengthB).toBe(2);
    });

    it('con azar distinto puede dar otro reparto, siempre parejo', () => {
        const players = Array.from({ length: 10 }, (_, i) => p(`p${i}`, 'intermediate'));
        let seed = 1;
        const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const first = balanceTeams(players, random);
        const second = balanceTeams(players, random);
        expect(first.a).not.toEqual(second.a);
        expect(first.strengthA).toBe(second.strengthA);
    });
});
