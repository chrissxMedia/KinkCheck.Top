import { getCollection } from "astro:content";
import { assert, test } from "vitest";
import type { template } from "../src/base";

const templates: template[] = await getCollection("templates").then(x => x.map(t => t.data));

for (const t of templates) {
    test(`${t.id} revisions are unique`, () => {
        const rs = t.revisions.map(r => r.revision);
        for (const r of rs) {
            assert(rs.filter(s => s === r).length === 1, `${t.id} has revision ${r} twice`);
        }
    });
}

test("kink ids are unique", () => {
    for (const t of templates.flatMap(t => t.revisions.map(r => ({ ...t, ...r })))) {
        const ids = t.kinks.flatMap(([, ks]) => ks.map(([, , id]) => id));
        for (const id of ids) {
            assert(ids.filter(i => i === id).length === 1, `${t.id}@${t.revision}: id ${id} is used twice`);
        }
    }
});
