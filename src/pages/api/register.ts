import type { APIRoute } from "astro";
import { supabase } from "../../backendlib";

export const POST: APIRoute = async ({ request, redirect }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const captchaToken = formData.get("h-captcha-response")?.toString();

    if (!email || !username || !password || !captchaToken) {
        return new Response(`No ${!email ? "email" : !username ? "username" : !password ? "password" : "captcha token"} given`, { status: 400 });
    }

    const { error } = await supabase.auth.signUp({ email, password, options: { captchaToken, data: { username } } });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return redirect("/signin?registered");
};
