import { expect, test } from "vitest";
import { decodeKinkCheck, encodeKinkCheck, updateCheck } from "../src/base";
import type { checkData, TRData } from "../src/zod";

const exampleMeta1: TRData = {
    kinks: [
        ["Category 1", [
            ["Kink A", ["top", "bottom"], 0, ""],
            ["Kink B", ["dom", "sub"], 1, ""],
        ]],
        ["Category 2", [
            ["Kink C", [""], 2, ""],
        ]],
    ],
};

const exampleMeta2: TRData = {
    kinks: [
        ["Category 1", [
            ["Kink B", ["give", "receive"], 1, ""],
        ]],
        ["Category 2", [
            ["Kink C", ["dom", "sub"], 2, ""],
        ]],
        ["Category 3", [
            ["Kink A'", ["top", "bottom"], 0, ""],
            ["Kink D", [""], 3, ""],
        ]],
    ],
};

const exampleCheck: checkData = { ratings: [[1, 2], [3, 4], 1.5] };
const exampleCheck2: checkData = { ratings: [[1, 2], [3, 4], 1.5, 0] };

test("re-encoding", () => {
    expect(encodeKinkCheck(exampleMeta1, decodeKinkCheck(exampleMeta1, exampleCheck)))
        .toStrictEqual(exampleCheck);
});

test("extra data is ignored", () => {
    expect(decodeKinkCheck(exampleMeta1, { extra: "data", ...exampleCheck } as checkData))
        .toStrictEqual(decodeKinkCheck(exampleMeta1, exampleCheck));
});

test("extra kinks are ignored", () => {
    expect(decodeKinkCheck(exampleMeta1, { ...exampleCheck, ratings: [...exampleCheck.ratings, [0, 1]] }))
        .toStrictEqual(decodeKinkCheck(exampleMeta1, exampleCheck));
});

test("moving kinks around and slightly adjusting them results in the same encoding", () => {
    expect(encodeKinkCheck(exampleMeta2, decodeKinkCheck(exampleMeta2, exampleCheck)))
        .toStrictEqual(exampleCheck2);
});

test("updating with an old revision doesn't trash ratings for newer kinks", () => {
    expect(updateCheck(exampleCheck2, exampleCheck)).toStrictEqual(exampleCheck2);
});
