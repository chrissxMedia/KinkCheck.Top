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
// TODO: rename
export type template_revision = { kinks: kinklist };
// TODO: check whether astro:db can handle this
export type template = {
    id: string;
    revision: string;
    created_at: Date;
    type: "full";
    name: string;
    data: template_revision;
};
export type check = {
    id: string;
    template_id: string;
    template_revision: string;
    created_at: Date;
    data: { ratings: any };
};

const valueForAllKinks = <T>(kinks: kinklist, x: T) =>
    kinks.map<T[][]>((c) => c[1].map((k) => k[1].map(() => x)));

export type ratings = number[][][];
export const defaultRatings = (kinks: kinklist): ratings => valueForAllKinks(kinks, 0);
export type kinkcheck = { ratings: ratings };
export const defaultKinkcheck = (kinks: kinklist): kinkcheck => ({ ratings: defaultRatings(kinks) });

function packIndexedValues<T>(indexedValues: [number, T][]): T[] {
    return indexedValues.reduce<T[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(Math.max(...indexedValues.map(([idx]) => idx))));
}

export function encodeKinkCheck({ kinks }: template_revision, { ratings }: kinkcheck): { ratings: any } {
    const r = packIndexedValues(ratings.flatMap((_, cat) =>
        kinks[cat][1].map<[number, number[]]>(([, , id], i) => [id, ratings[cat][i]])));
    return { ratings: r };
}

export function decodeKinkCheck({ kinks }: template_revision, s: { ratings: any }): kinkcheck {
    const ratings = defaultRatings(kinks);
    s.ratings.forEach((rat: number[] | undefined, id: number) => {
        if (!rat) return;
        ratings.forEach((_, cat) => {
            ratings[cat].forEach((_, i) => {
                if (kinks[cat][1][i][2] === id) {
                    ratings[cat][i] = rat;
                }
            });
        });
    });
    return { ratings };
}
