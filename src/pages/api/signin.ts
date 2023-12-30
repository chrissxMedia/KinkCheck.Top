import type { APIRoute } from "astro";
import { authProviders, oauthOptions, supabase } from "../../base";
import { type Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const captchaToken = formData.get("h-captcha-response")?.toString();
    const provider = formData.get("provider")?.toString();

    if (provider && authProviders.map(([id]) => id).includes(provider)) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as Provider,
            options: oauthOptions,
        });

        if (error) {
            return new Response(error.message, { status: 500 });
        }

        return redirect(data.url);
    }

    if (!email || !password || !captchaToken) {
        return new Response(`No ${!email ? "email" : !password ? "password" : "captcha token"} given`, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, { path: "/" });
    cookies.set("sb-refresh-token", refresh_token, { path: "/" });
    return redirect("/");
};
