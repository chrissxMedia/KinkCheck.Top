import { nanoid } from "nanoid";
import { defineAction, ActionError } from "astro:actions";
import { db, getTemplateVersion } from "../db";
import { Check, checkInsertSchema } from "../db/config";
import { decodeKinkCheck, encodeKinkCheck } from "../base";

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
                    data = encodeKinkCheck(template, decodeKinkCheck(template, input.data));
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
