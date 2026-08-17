import type { checkData, TRData } from "./zod";

export const ratings: [string, string][] = [
    ["i dont know", "#d0d0d0"],
    ["favorite", "#00e0e0"],
    ["want to do", "#00c020"],
    ["could be convinced", "#eeee20"],
    ["not interested", "#d02000"],
    ["hard limit", "#303030"],
];

const valueForAllKinks = <T>({ kinks }: TRData, x: T) =>
    kinks.map<T[][]>((c) => c[1].map((k) => k[1].map(() => x)));

/** The runtime / template-specific representation of a check */
export type kinkcheck = { ratings: number[][][] };
export const defaultKinkcheck = (t: TRData): kinkcheck => ({ ratings: valueForAllKinks(t, 0) });

function packIndexedValues<T>(indexedValues: [number, T][]): (T | undefined)[] {
    if (!indexedValues.length) return [];
    return indexedValues.reduce<T[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(Math.max(...indexedValues.map(([idx]) => idx)) + 1));
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
        ks.flatMap(([, , kid], i): [number, number[]][] => kid.length === 1
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
