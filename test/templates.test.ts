import { getCollection } from "astro:content";
import { assert, expect, test } from "vitest";
import type { template } from "../src/zod";
import { tMeta } from "../src/content.config";
import { getTemplateVersion } from "../src/db";
import { readdir } from "node:fs/promises";

test("every template directory has tMeta metadata and vice versa", async () => {
    const ids = (await readdir("templates", { withFileTypes: true }))
        .filter((e) => e.isDirectory()).map((e) => e.name);
    expect(ids.toSorted()).toStrictEqual(tMeta.map(({ id }) => id).toSorted());
});

const templates: template[] = await getCollection("templates").then(x => x.map(t => t.data));

test("collection loads every template in tMeta", () => {
    expect(templates.map(({ id }) => id).toSorted()).toStrictEqual(tMeta.map(({ id }) => id).toSorted());
});

for (const t of templates) {
    test(`${t.id} revisions are unique`, () => {
        const rs = t.revisions.map(r => r.revision);
        for (const r of rs) {
            assert(rs.filter(s => s === r).length === 1, `${t.id} has revision ${r} twice`);
        }
    });
}

// TODO: test across revisions
test("kink ids are unique", () => {
    for (const t of templates.flatMap(t => t.revisions.map(r => ({ ...t, ...r })))) {
        const ids = t.kinks.flatMap(([, ks]) => ks.flatMap(([, , id]) => id));
        for (const id of ids) {
            assert(ids.filter(i => i === id).length === 1, `${t.id}@${t.revision}: id ${id} is used twice`);
        }
    }
});

// Equivalent names across all KCC revisions, matched exactly.
const aliases: Record<string, string[][]> = {
    kcc: [
        ["Fingering", "Vaginal Fingering"],
        ["Fisting", "Vaginal Fisting"],
        ["Anal Sex", "Anal Penetration"],
        ["Daddy/Little", "Little/Daddy*Mommy", "Little/Caregiver"],
        ["Master/Slave", "Slave/Master*Mistress"],
        ["Master/Pet", "Pet/Owner"],
        ["Power Exchange", "Power Exchange (24/7)"],
        ["Encasement", "Encasement/Cages"],
        ["Rape", "Rape/CNC", "CNC/Rapeplay"],
        ["Diapers", "Diapers/ABDL"],
        ["Feminization", "Feminization/Sissy"],
        ["Stockings", "Stockings/Pantyhose"],
        ["Furry-Roleplay", "Furry"],
        ["Cutting", "Cutting/Knifeplay"],
    ],
};

test("every alias group only contains names that occur in the template", () => {
    for (const [tid, groups] of Object.entries(aliases)) {
        const names = new Set(templates.find(t => t.id === tid)!.revisions
            .flatMap(r => r.kinks.flatMap(([, ks]) => ks.map(([name]) => name))));
        for (const group of groups) {
            assert(group.length >= 2, `${tid}: alias group is a singleton: ${group}`);
            for (const name of group) {
                assert(names.has(name), `${tid}: alias ${name} does not occur`);
            }
        }
    }
});

test("getTemplateVersion resolves falsy revisions to the current one", async () => {
    for (const t of templates) {
        for (const rev of [undefined, null, ""] as const) {
            expect(await getTemplateVersion(t.id, rev)).toStrictEqual({ ...t, ...t.revisions[0] });
        }
    }
});

test("getTemplateVersion resolves named revisions and rejects unknown ones", async () => {
    for (const t of templates) {
        for (const r of t.revisions) {
            expect(await getTemplateVersion(t.id, r.revision)).toMatchObject({ id: t.id, revision: r.revision });
        }
        expect(await getTemplateVersion(t.id, "no-such-revision")).toBeNull();
        expect(await getTemplateVersion("no-such-template", t.revisions[0]?.revision)).toBeNull();
    }
});
