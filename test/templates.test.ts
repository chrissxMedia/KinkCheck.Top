import { assert, test } from "vitest";
import { templates } from "../db/seed";

test("template revisions are unique", () => {
    const x = new Map<string, string[]>(templates.map((t) => [t.id, []]));
    for (const t of templates) {
        assert(!x.get(t.id)!.includes(t.revision), `${t.id} has revision ${t.revision} twice`);
        x.get(t.id)!.push(t.revision);
    }
});

test("kink ids are unique", () => {
    for (const t of templates) {
        const ids = t.data.kinks.flatMap(([, ks]) => ks.map(([, , id]) => id));
        const seen = new Set<number>();
        for (const id of ids) {
            assert(!seen.has(id), `${t.id}@${t.revision}: id ${id} is used twice`);
            seen.add(id);
        }
    }
});
