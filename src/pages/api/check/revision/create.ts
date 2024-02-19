import type { APIRoute } from "astro";
import { createCheckMeta, createCheckRevision, getCheck, getUser } from "../../../../backendlib";

export const POST: APIRoute = async ({ request, cookies }) => {
    const formData = await request.formData();
    const template = formData.get("template")?.toString();
    const version = formData.get("version")?.toString();
    const data = formData.get("data")?.toString();

    if (!template || !version || !data) {
        return new Response(`No ${!template ? "template" : !version ? "template version" : "data"} given`, { status: 400 });
    }

    const [user, error] = await getUser({ cookies });

    if (error) {
        return new Response(error.message, { status: error.status ?? 500 });
    }

    if (!user) {
        return new Response("Not logged in.", { status: 400 });
    }

    const [check] = await getCheck({ user: user.id, template });
    const e = !check && await createCheckMeta({ user_id: user.id, template, visibility: "private" });

    if (e) {
        return new Response(e.message, { status: 500 });
    }

    const err = await createCheckRevision({ user: user.id, template, version, data: JSON.parse(data) });

    if (err) {
        return new Response(err.message, { status: 500 });
    }

    return new Response("Saved.");
};
