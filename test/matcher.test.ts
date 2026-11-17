import { expect, test } from "vitest";
import { match } from "../src/base";
import type { validRating } from "../src/zod";

const ratings: validRating[] = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const expected: validRating[][] = [
    [0,   1,   1.5, 2,   2.5, 3,   3.5, 4,   4.5, 5],
    [1,   1,   1.5, 1.5, 2,   2,   2.5, 2.5, 3,   5],
    [1.5, 1.5, 1.5, 2,   2,   2.5, 2.5, 3,   3,   5],
    [2,   1.5, 2,   2,   2.5, 2.5, 3,   3,   3.5, 5],
    [2.5, 2,   2,   2.5, 2.5, 3,   3,   3.5, 3.5, 5],
    [3,   2,   2.5, 2.5, 3,   3,   3.5, 3.5, 4,   5],
    [3.5, 2.5, 2.5, 3,   3,   3.5, 3.5, 4,   4,   5],
    [4,   2.5, 3,   3,   3.5, 3.5, 4,   4,   4.5, 5],
    [4.5, 3,   3,   3.5, 3.5, 4,   4,   4.5, 4.5, 5],
    [5,   5,   5,   5,   5,   5,   5,   5,   5,   5],
];

test.each(expected.flatMap((row, i) => row.map((result, j) => ({
    a: ratings[i], b: ratings[j], result,
}))))("matching $a with $b gives $result", ({ a, b, result }) => {
    expect(match({ ratings: [[[a]]] }, { ratings: [[[b]]] }))
        .toStrictEqual({ ratings: [[[result]]] });
});

test("matching empty checks gives an empty check", () => {
    expect(match({ ratings: [] }, { ratings: [] })).toStrictEqual({ ratings: [] });
});
