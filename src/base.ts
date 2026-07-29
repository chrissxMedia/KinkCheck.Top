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

function packIndexedValues<T>(indexedValues: [number, T][]): T[] {
    return indexedValues.reduce<T[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(Math.max(...indexedValues.map(([idx]) => idx))));
}

export function updateCheck(oldCheck: checkData, newCheck: checkData): checkData {
    const ratings = Array(Math.max(oldCheck.ratings.length, newCheck.ratings.length));
    for (let i = 0; i < ratings.length; i++) {
        const a = oldCheck.ratings[i], b = newCheck.ratings[i];
        ratings[i] = !a || !b ? a || b : b.length ? b : a.length ? a : undefined;
    }
    return { ratings };
}

export function encodeKinkCheck({ kinks }: TRData, { ratings }: kinkcheck): checkData {
    const r = packIndexedValues(ratings.flatMap((_, cat) =>
        kinks[cat][1].map<[number, number[]]>(([, , id], i) => [id, ratings[cat][i]])));
    return { ratings: r } as checkData;
}

export function decodeKinkCheck({ kinks }: TRData, s: checkData): kinkcheck {
    const { ratings } = defaultKinkcheck({ kinks });
    ratings.forEach((_, cat) => {
        ratings[cat].forEach((_, i) => {
            const [, pos, kid] = kinks[cat][1][i];
            const r = s.ratings[kid];
            if (!r) return;
            if (r.length === pos.length) {
                ratings[cat][i] = r;
            } else if (new Set(r).size === 1) {
                ratings[cat][i] = Array(pos.length).fill(r[0]);
            }
        });
    });
    return { ratings };
}
