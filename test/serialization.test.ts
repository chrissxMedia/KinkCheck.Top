import { expect, test } from "vitest";
import { decodeKinkCheck, encodeKinkCheck, type kinklist, type kinkcheck } from "../src/base";

const exampleMeta1 = {
    kinks: [
        ["Category 1", [
            ["Kink A", ["top", "bottom"], 0],
            ["Kink B", ["dom", "sub"], 1],
        ]],
        ["Category 2", [
            ["Kink C", [""], 2],
        ]],
    ] as kinklist,
};

const exampleMeta2 = {
    kinks: [
        ["Category 1", [
            ["Kink B", ["give", "receive"], 1],
        ]],
        ["Category 2", [
            ["Kink C", [""], 2],
        ]],
        ["Category 3", [
            ["Kink A'", ["top", "bottom"], 0],
        ]],
    ] as kinklist,
};

const exampleCheck1: kinkcheck = { ratings: [[[1, 2], [3, 4]], [[1.5]]] };
const exampleCheck2: kinkcheck = { ratings: [[[3, 4]], [[1.5]], [[1, 2]]] };

test("re-encoding", () => {
    expect(encodeKinkCheck(exampleMeta1, decodeKinkCheck(exampleMeta1, JSON.stringify(exampleCheck1)))).toBe(JSON.stringify(exampleCheck1));
});

test("extra data is ignored", () => {
    expect(decodeKinkCheck(exampleMeta1, JSON.stringify({ extra: "data", ...exampleCheck1 })))
        .toStrictEqual(decodeKinkCheck(exampleMeta1, JSON.stringify(exampleCheck1)));
});

test("extra kinks are ignored", () => {
    expect(decodeKinkCheck(exampleMeta1, JSON.stringify({ ...exampleCheck1, ratings: [...exampleCheck1.ratings, [0, 1]] })))
        .toStrictEqual(decodeKinkCheck(exampleMeta1, JSON.stringify(exampleCheck1)));
});

test("moving kinks around and slightly adjusting them results in the same encoding", () => {
    expect(encodeKinkCheck(exampleMeta1, exampleCheck1)).toBe(encodeKinkCheck(exampleMeta2, exampleCheck2));
});
