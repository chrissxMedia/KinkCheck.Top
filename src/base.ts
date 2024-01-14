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
export type kinklist = [string, kink[]][]; // TODO: | kink[]
export type template = {
    id: string;
    type: "full"; // TODO: | "single-category" | // "sliders" or "compass" or sth
    owner: string;
    name: string;
    // TODO: consider: description?: string;
};
export type template_revision = {
    id: string;
    version: string;
    created: Date;
    kinks: kinklist;
};

export type ratings = number[][][];
//export type checklist = boolean[][][];
export type kinkcheck = { ratings: ratings };

export type check = {
    user_id: string;
    template: string;
    visibility: "private" | "public";
};
export type check_revision = {
    user_id: string;
    template: string;
    version: string;
    modified: Date;
    data: kinkcheck;
};

const valueForAllKinks = <T>(kinks: kinklist, x: T) => kinks.map(([, kinks]) => kinks.map((k) => k[1].map(() => x)));
export const defaultRatings = (kinks: kinklist): ratings => valueForAllKinks(kinks, 0);
//export const defaultChecklist = (kinks: kinklist): checklist => valueForAllKinks(kinks, false);

function packIndexedValues<T>(indexedValues: [number, T][]): T[] {
    return indexedValues.reduce<T[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(Math.max(...indexedValues.map(([idx]) => idx))));
}

export function encodeKinkCheck({ kinks }: { kinks: kinklist }, { ratings }: kinkcheck): string {
    const r = packIndexedValues(ratings.flatMap((_, cat) =>
        kinks[cat][1].map<[number, number[]]>(([, , id], i) => [id, ratings[cat][i]])));
    return JSON.stringify({ ratings: r });
}

export function decodeKinkCheck({ kinks }: { kinks: kinklist }, s: string): kinkcheck {
    const ratings = defaultRatings(kinks);
    JSON.parse(s).ratings.forEach((rat: number[], id: number) => {
        ratings.forEach((_, cat) => {
            ratings[cat].forEach((_, i) => {
                if (kinks[cat][1][i][2] === id) {
                    // TODO: do something if the number of positions is different
                    ratings[cat][i] = rat;
                }
            });
        });
    });
    return { ratings };
}
