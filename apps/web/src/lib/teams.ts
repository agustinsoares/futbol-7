// Reparto de jugadores en dos equipos parejos.
//
// 1. Los arqueros se reparten primero, uno para cada lado.
// 2. El resto, del más fuerte al más débil, va al equipo con menos "peso" (suma de niveles)
//    siempre que no tenga ya más jugadores que el otro.
// Con `random` se desempatan jugadores del mismo nivel al azar, para poder "barajar de nuevo".

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface TeamPlayer {
    id: string;
    level: Level | null;
    position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any' | null;
}

export interface Teams {
    a: string[];
    b: string[];
    strengthA: number;
    strengthB: number;
}

const WEIGHT: Record<Level, number> = { beginner: 1, intermediate: 2, advanced: 3 };

export function playerWeight(player: TeamPlayer): number {
    return player.level ? WEIGHT[player.level] : WEIGHT.intermediate;
}

export function balanceTeams(players: TeamPlayer[], random: () => number = () => 0.5): Teams {
    const a: TeamPlayer[] = [];
    const b: TeamPlayer[] = [];
    const sum = (team: TeamPlayer[]) => team.reduce((total, p) => total + playerWeight(p), 0);
    const maxSize = Math.ceil(players.length / 2);

    // Orden: más fuerte primero; empates al azar (o estables si random es constante).
    const keyed = players.map((p) => ({ p, tie: random() }));
    const byStrength = (x: { p: TeamPlayer; tie: number }, y: { p: TeamPlayer; tie: number }) =>
        playerWeight(y.p) - playerWeight(x.p) || x.tie - y.tie;

    const keepers = keyed.filter((k) => k.p.position === 'goalkeeper').sort(byStrength);
    const others = keyed.filter((k) => k.p.position !== 'goalkeeper').sort(byStrength);

    function place(player: TeamPlayer) {
        const aFull = a.length >= maxSize;
        const bFull = b.length >= maxSize;
        let target: TeamPlayer[];
        if (aFull) target = b;
        else if (bFull) target = a;
        else if (a.length !== b.length) target = a.length < b.length ? a : b;
        else target = sum(a) <= sum(b) ? a : b;
        target.push(player);
    }

    // Un arquero por equipo (alternando); los que sobren juegan de campo.
    keepers.forEach(({ p }, index) => {
        if (index < 2) (index === 0 ? a : b).push(p);
        else others.push({ p, tie: random() });
    });
    others.sort(byStrength);

    for (const { p } of others) {
        // Con el mismo número de jugadores, el más débil de peso recibe al siguiente.
        if (a.length === b.length && a.length < maxSize && b.length < maxSize) {
            (sum(a) <= sum(b) ? a : b).push(p);
        } else {
            place(p);
        }
    }

    return { a: a.map((p) => p.id), b: b.map((p) => p.id), strengthA: sum(a), strengthB: sum(b) };
}
