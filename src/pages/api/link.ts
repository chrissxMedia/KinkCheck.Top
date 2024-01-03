import type { APIRoute } from "astro";
import { authProviders, getUser, oauthOptions, supabase } from "../../base";
import { type Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const provider = formData.get("provider")?.toString();

    if (!provider || !authProviders.map(([id]) => id).includes(provider)) {
        return new Response(`Invalid/unsupported authentication provider: ${provider}`, { status: 400 });
    }

    const [, error] = await getUser({ cookies });

    if (error) {
        return new Response(error.message, { status: error.status ?? 500 });
    }

    const { data, error: err } = await supabase.auth.linkIdentity({
        provider: provider as Provider,
        options: oauthOptions,
    });

    if (err) {
        return new Response(err.message, { status: err.status ?? 500 });
    }

    return redirect(data.url);
};
