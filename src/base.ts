import type { checkData, TRData, validRating } from "./zod";

export const ratings: string[] = [
    "i dont know",
    "favorite",
    "want to do",
    "could be convinced",
    "not interested",
    "hard limit",
];

const valueForAllKinks = <T>({ kinks }: TRData, x: T) =>
    kinks.map<T[][]>((c) => c[1].map((k) => k[1].map(() => x)));

/** The runtime / template-specific representation of a check */
export type kinkcheck = { ratings: validRating[][][] };
export const defaultKinkcheck = (t: TRData): kinkcheck => ({ ratings: valueForAllKinks(t, 0) });

function matchRating(a: validRating, b: validRating): validRating {
    if (!a || !b) return a || b;
    if (a == 5 || b == 5) return 5;
    return (Math.round(a + b) / 2) as validRating;
}

export function match(
    { ratings: a }: kinkcheck,
    { ratings: b }: kinkcheck,
): kinkcheck {
    return {
        ratings: a.map((rA, cat) =>
            rA.map((rsA, kink) =>
                rsA.map((ratA, pos) => matchRating(ratA, b[cat][kink][pos])),
            ),
        ),
    };
}

function packIndexedValues<T>(indexedValues: [number, T][]): (T | undefined)[] {
    if (!indexedValues.length) return [];
    return indexedValues.reduce<T[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(indexedValues.map(([i]) => i).reduce((a, b) => a > b ? a : b) + 1));
}

export function updateCheck(oldCheck: checkData, newCheck: checkData): checkData {
    const ratings = Array(Math.max(oldCheck.ratings.length, newCheck.ratings.length));
    for (let i = 0; i < ratings.length; i++) {
        const a = oldCheck.ratings[i], b = newCheck.ratings[i];
        ratings[i] = typeof b === "number" || (b && b.length) ? b : a;
    }
    return { ratings };
}

export function encodeKinkCheck({ kinks }: TRData, { ratings }: kinkcheck): checkData {
    const r = packIndexedValues(kinks.flatMap(([, ks], cat) =>
        ks.flatMap(([, , kid], i): [number, validRating[]][] => kid.length === 1
            ? [[kid[0], ratings[cat][i]]]
            : kid.map((id, p) => [id, [ratings[cat][i][p]]]))));
    return { ratings: r.map(x => x ? (new Set(x).size === 1 ? x[0] : x) : []) } as checkData;
}

export function decodeKinkCheck({ kinks }: TRData, s: checkData): kinkcheck {
    const { ratings } = defaultKinkcheck({ kinks });
    ratings.forEach((_, cat) => {
        ratings[cat].forEach((_, i) => {
            const [, pos, kid] = kinks[cat][1][i];
            for (let p = 0; p < pos.length; p++) {
                const r = s.ratings[kid.length === 1 ? kid[0] : kid[p]] ?? [];
                if (typeof r === "number") {
                    ratings[cat][i][p] = r;
                } else if (new Set(r).size === 1) {
                    ratings[cat][i][p] = r[0];
                } else if (kid.length === 1 && r.length === pos.length) {
                    ratings[cat][i] = r;
                }
            }
        });
    });
    return { ratings };
}
