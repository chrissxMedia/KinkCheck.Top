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

for (const t of templates) {
    test(`${t.id} kink ids are unique within revisions and imply equivalent names across revisions`, () => {
        const canonical = (name: string) =>
            aliases[t.id]?.find(group => group.includes(name))?.[0] ?? name;
        const seen = new Set<string>();
        const names = new Map<number, string>();
        const entries = t.revisions.flatMap(r =>
            r.kinks.flatMap(([cat, ks]) =>
                ks.flatMap(([name, , ids]) => ids.map(id => ({ id, name, rev: r.revision, cat })))));
        for (const { id, name, rev } of entries) {
            const occurrence = `${rev}:${id}`;
            assert(!seen.has(occurrence), `${t.id}@${rev}: id ${id} is used twice`);
            seen.add(occurrence);
            const previous = names.get(id);
            if (previous !== undefined && previous !== canonical(name)) {
                const lines = entries.filter(e => e.id === id)
                    .map(e => `  ${e.rev} (${e.cat}): ${e.name}`);
                assert(false, `${t.id}, ID ${id}\n${lines.join("\n")}`);
            }
            names.set(id, canonical(name));
        }
    });
}

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
