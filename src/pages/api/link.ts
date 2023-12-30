import type { APIRoute } from "astro";
import { authProviders, oauthOptions, supabase } from "../../base";
import { type Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const provider = formData.get("provider")?.toString();
    const access_token = cookies.get("sb-access-token")?.value;
    const refresh_token = cookies.get("sb-refresh-token")?.value;

    if (!access_token || !refresh_token) {
        return new Response("Not logged in", { status: 400 });
    }

    if (!provider || !authProviders.map(([id]) => id).includes(provider)) {
        return new Response(`Invalid/unsupported authentication provider: ${provider}`, { status: 400 });
    }

    const { error } = await supabase.auth.setSession({ access_token, refresh_token });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    const { data, error: err } = await supabase.auth.linkIdentity({
        provider: provider as Provider,
        options: oauthOptions,
    });

    if (err) {
        return new Response(err.message, { status: 500 });
    }

    return redirect(data.url);
};
