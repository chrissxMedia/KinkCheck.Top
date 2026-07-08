import { nanoid } from "nanoid";
import { defineAction, ActionError } from "astro:actions";
import { db, getTemplateVersion } from "../db";
import { Check, checkData, checkInsertSchema } from "../db/config";
import { decodeKinkCheck, encodeKinkCheck, type template_revision } from "../base";

// FIXME: when switching between revisions there will be broken data that will fail these checks
export function sanitizeCheck(tr: template_revision, data: checkData): checkData {
    for (const [, kinks] of tr.kinks) {
        for (const [kink, positions, id] of kinks) {
            const rating = data.ratings[id];
            if (rating && rating.length !== positions.length) {
                throw new TypeError(`rating length mismatch for kink "${kink}" (${id})`);
            }
        }
    }
    const maxId = Math.max(...tr.kinks.flatMap(([, kinks]) => kinks.map(([, , id]) => id)));
    if (data.ratings.length > maxId + 1) {
        throw new TypeError(`number of ratings (${data.ratings.length}) is bigger than it should be`);
    }
    return encodeKinkCheck(tr, decodeKinkCheck(tr, data));
}

export const server = {
    check: {
        save: defineAction({
            input: checkInsertSchema.pick({ template_id: true, template_revision: true, data: true }),
            handler: async (input) => {
                const template = await getTemplateVersion(input.template_id, input.template_revision);
                if (!template) {
                    throw new ActionError({ code: "NOT_FOUND", message: `template revision ${input.template_id}@${input.template_revision} not found` });
                }

                let data: object;
                try {
                    data = sanitizeCheck(template, input.data);
                } catch (e) {
                    throw new ActionError({ code: "BAD_REQUEST", message: `invalid data: ${e}` });
                }

                const id = nanoid(16);

                await db.insert(Check).values({
                    id,
                    ...input,
                    created_at: new Date(),
                    user_id: null,
                    data,
                });

                return { id };
            },
        }),
    },
};
