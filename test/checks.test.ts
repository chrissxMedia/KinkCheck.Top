import { expect, test } from "vitest";
import { decodeKinkCheck, encodeKinkCheck, updateCheck, type template_revision } from "../src/base";
import type { checkData } from "../src/db/config";
import { sanitizeCheck } from "../src/actions";

const exampleMeta1: template_revision = {
    revision: "0.1",
    created: new Date(),
    kinks: [
        ["Category 1", [
            ["Kink A", ["top", "bottom"], 0],
            ["Kink B", ["dom", "sub"], 1],
        ]],
        ["Category 2", [
            ["Kink C", [""], 2],
        ]],
    ],
};

const exampleMeta2: template_revision = {
    revision: "0.2",
    created: new Date(),
    kinks: [
        ["Category 1", [
            ["Kink B", ["give", "receive"], 1],
        ]],
        ["Category 2", [
            ["Kink C", ["dom", "sub"], 2],
        ]],
        ["Category 3", [
            ["Kink A'", ["top", "bottom"], 0],
            ["Kink D", [""], 3],
        ]],
    ],
};

const exampleCheck: checkData = { ratings: [[1, 2], [3, 4], [1.5]] };
const exampleCheck15: checkData = { ratings: [[1, 2], [3, 4], [1.5], [0]] };
const exampleCheck2: checkData = { ratings: [[1, 2], [3, 4], [1.5, 1.5], [0]] };

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

test("valid input passes", () => {
    expect(sanitizeCheck(exampleMeta1, exampleCheck)).toStrictEqual(exampleCheck);
});

test("empty ratings array", () => {
    expect(() => sanitizeCheck(exampleMeta1, { ratings: [] })).not.toThrow();
});

test("incorrect number of positions", () => {
    expect(() => sanitizeCheck(exampleMeta1, { ratings: [[0]] })).toThrow();
});

test("updating with an old revision doesn't trash ratings for newer kinks", () => {
    expect(updateCheck(exampleCheck2, exampleCheck)).toStrictEqual(exampleCheck15);
});
