import type { checkData } from "./db/config";

export const ratings: [string, string][] = [
    ["i dont know", "#d0d0d0"],
    ["favorite", "#00e0e0"],
    ["want to do", "#00c020"],
    ["could be convinced", "#eeee20"],
    ["not interested", "#d02000"],
    ["hard limit", "#303030"],
];

export type positions = [string, string] | [""];
export type kink = [string, positions, number] | [string, positions, number, string];
export type kinklist = [string, kink[]][];
export type template_revision = {
    revision: string;
    created: Date;
    kinks: kinklist;
};
export type template = {
    id: string;
    type: "full";
    name: string;
    revisions: template_revision[];
};

const valueForAllKinks = <T>(kinks: kinklist, x: T) =>
    kinks.map<T[][]>((c) => c[1].map((k) => k[1].map(() => x)));

export type ratings = number[][][];
const defaultRatings = (kinks: kinklist): ratings => valueForAllKinks(kinks, 0);
/** The runtime / template-specific representation of a check */
export type kinkcheck = { ratings: ratings };
export const defaultKinkcheck = (kinks: kinklist): kinkcheck => ({ ratings: defaultRatings(kinks) });

function packIndexedValues<T>(indexedValues: [number, T][]): T[] {
    return indexedValues.reduce<T[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(Math.max(...indexedValues.map(([idx]) => idx))));
}

export function encodeKinkCheck({ kinks }: template_revision, { ratings }: kinkcheck): checkData {
    const r = packIndexedValues(ratings.flatMap((_, cat) =>
        kinks[cat][1].map<[number, number[]]>(([, , id], i) => [id, ratings[cat][i]])));
    return { ratings: r } as checkData;
}

export function decodeKinkCheck({ kinks }: template_revision, s: checkData): kinkcheck {
    const ratings = defaultRatings(kinks);
    s.ratings.forEach((rat: number[] | undefined, id: number) => {
        if (!rat) return;
        let r: number[] = rat; // ← dumb hack bc apparently typescript can't figure it out
        ratings.forEach((_, cat) => {
            ratings[cat].forEach((_, i) => {
                const [, pos, kid] = kinks[cat][1][i];
                if (kid === id) {
                    if(r.length === pos.length) {
                        ratings[cat][i] = r;
                    } else if (new Set(r).size === 1) {
                        ratings[cat][i] = Array(pos.length).fill(r[0]);
                    }
                }
            });
        });
    });
    return { ratings };
}
