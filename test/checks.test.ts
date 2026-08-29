import { expect, test } from "vitest";
import { decodeKinkCheck, encodeKinkCheck, updateCheck } from "../src/base";
import type { checkData, TRData } from "../src/zod";

const exampleMeta1: TRData = {
    kinks: [
        ["Category 1", [
            ["Kink A", ["top", "bottom"], [0], ""],
            ["Kink B", ["dom", "sub"], [1], ""],
        ]],
        ["Category 2", [
            ["Kink C", [""], [2], ""],
        ]],
    ],
};

const exampleMeta2: TRData = {
    kinks: [
        ["Category 1", [
            ["Kink B", ["give", "receive"], [1], ""],
        ]],
        ["Category 2", [
            ["Kink C", ["dom", "sub"], [2], ""],
        ]],
        ["Category 3", [
            ["Kink A'", ["top", "bottom"], [0], ""],
            ["Kink D", [""], [3], ""],
        ]],
    ],
};

const exampleMetaMerged: TRData = {
    kinks: [
        ["Category 1", [
            ["Kink AB", ["a", "b"], [0, 1], ""],
            ["Kink C", [""], [2], ""],
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

test("merged kink carries over ratings from both original kinks", () => {
    expect(decodeKinkCheck(exampleMetaMerged, { ratings: [2, 4, []] }))
        .toStrictEqual({ ratings: [[[2, 4], [0]]] });
});

test("heterogeneous legacy array under one id is ignored for merged kinks", () => {
    expect(decodeKinkCheck(exampleMetaMerged, { ratings: [[2, 3], 4, []] }))
        .toStrictEqual({ ratings: [[[0, 4], [0]]] });
});

test("merged kink fills positions from a single unique rating", () => {
    expect(decodeKinkCheck(exampleMetaMerged, { ratings: [2, 2, []] }))
        .toStrictEqual({ ratings: [[[2, 2], [0]]] });
});

test("merged kink with only one rated side keeps the other at default", () => {
    expect(decodeKinkCheck(exampleMetaMerged, { ratings: [2, [], []] }))
        .toStrictEqual({ ratings: [[[2, 0], [0]]] });
});

test("merged kink collapses a legacy array with one unique rating to its position", () => {
    expect(decodeKinkCheck(exampleMetaMerged, { ratings: [[3, 3], [], []] }))
        .toStrictEqual({ ratings: [[[3, 0], [0]]] });
});

test("merged kink round-trips", () => {
    const check: checkData = { ratings: [2, 4, 1.5] };
    expect(encodeKinkCheck(exampleMetaMerged, decodeKinkCheck(exampleMetaMerged, check)))
        .toStrictEqual(check);
});

test("merged kink encoding stays downgrade-compatible", () => {
    expect(decodeKinkCheck(exampleMeta1, encodeKinkCheck(exampleMetaMerged, { ratings: [[[2, 4], [1.5]]] })))
        .toStrictEqual({ ratings: [[[2, 2], [4, 4]], [[1.5]]] });
});

test("updating a legacy draft from a merged template lets new ratings win in all merged slots", () => {
    const legacy: checkData = { ratings: [2, 4, 1.5] };
    const x = encodeKinkCheck(exampleMetaMerged, { ratings: [[[2, 5], [1.5]]] });
    const merged = updateCheck(legacy, x);
    expect(decodeKinkCheck(exampleMetaMerged, merged)).toStrictEqual({ ratings: [[[2, 5], [1.5]]] });
});

test("encoding a merged kink emits scalar 0 for unrated positions", () => {
    expect(encodeKinkCheck(exampleMetaMerged, { ratings: [[[0, 4], [0]]] }))
        .toStrictEqual({ ratings: [0, 4, 0] });
});
