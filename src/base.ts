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

type RatingWeight = (rating: validRating, other: validRating) => number;

export const matchingWeights = {
    flat: {
        name: "Flat",
        description: "Both ratings have equal weight. (actual average)",
        weight: () => 1,
    },
    nicole: {
        name: "Nicole's",
        description: '"Favorite" counts 2× when the other person at least "could be convinced". Otherwise it counts 1×. "Want to do" and "could be convinced" count 1×. "Not interested" counts 2×, and halfway to "hard limit" counts 2.5×. The other half-steps are interpolated linearly.',
        weight: (rating: validRating, other: validRating) =>
            rating < 2 && other > 3 ? 1 : Math.max(1, 3 - rating, rating - 2),
    },
};
export type MatchingWeights = keyof typeof matchingWeights;

function matchRating(a: validRating, b: validRating, weight: RatingWeight): validRating {
    if (!a || !b) return a || b;
    if (a == 5 || b == 5) return 5;
    const weightA = weight(a, b), weightB = weight(b, a);
    const average = (a * weightA + b * weightB) / (weightA + weightB);
    return (Math.round(average * 2) / 2) as validRating;
}

export function match(
    { ratings: a }: kinkcheck,
    { ratings: b }: kinkcheck,
    weight: RatingWeight = matchingWeights.flat.weight,
): kinkcheck {
    return {
        ratings: a.map((rA, cat) =>
            rA.map((rsA, kink) =>
                rsA.map((ratA, pos) => matchRating(ratA, b[cat][kink][pos], weight)),
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
