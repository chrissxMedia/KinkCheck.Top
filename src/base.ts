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
    created: string;
    kinks: kinklist;
};
export type Template = template & { revisions: template_revision[] };
export type TemplateRevision = Template & template_revision;

// these are purely internal types!
export type ratings = number[][][];
//export type checklist = boolean[][][];
export type kinkcheck = { ratings: ratings };

export type check_data = { ratings: (number[] | undefined)[] };

export type check = {
    user_id: string;
    template: string;
    visibility: "private" | "public";
};
export type check_revision = {
    user_id: string;
    template: string;
    version: string;
    modified: string;
    data: check_data;
};
export type Check = check & { revisions: check_revision[] };
export type CheckRevision = Check & check_revision;

const valueForAllKinks = <T>(kinks: kinklist, x: T) => kinks.map(([, kinks]) => kinks.map((k) => k[1].map(() => x)));
export const defaultRatings = (kinks: kinklist): ratings => valueForAllKinks(kinks, 0);
//export const defaultChecklist = (kinks: kinklist): checklist => valueForAllKinks(kinks, false);

function packIndexedValues<T>(indexedValues: [number, T][]): (T | undefined)[] {
    return indexedValues.reduce<(T | undefined)[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(Math.max(...indexedValues.map(([idx]) => idx))));
}

export function encodeKinkCheck({ kinks }: { kinks: kinklist }, { ratings }: kinkcheck): check_data {
    const r = packIndexedValues(ratings.flatMap((_, cat) =>
        kinks[cat][1].map<[number, number[]]>(([, , id], i) => [id, ratings[cat][i]])));
    return { ratings: r };
}

export function decodeKinkCheck({ kinks }: { kinks: kinklist }, s: check_data): kinkcheck {
    const ratings = defaultRatings(kinks);
    s.ratings.forEach((rat, id) => {
        if (!rat) return;
        ratings.forEach((_, cat) => {
            ratings[cat].forEach((_, i) => {
                if (kinks[cat][1][i][2] === id) {
                    ratings[cat][i] = rat.length < ratings[cat][i].length ? [rat[0], rat[0]] : rat;
                }
            });
        });
    });
    return { ratings };
}

export function prettyDate(d: Date): string {
    const year = d.getUTCFullYear().toString().padStart(4, "0");
    const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = d.getUTCDate().toString().padStart(2, "0");
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const mins = d.getUTCMinutes().toString().padStart(2, "0");
    const secs = d.getUTCSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${mins}:${secs} UTC`;
}
