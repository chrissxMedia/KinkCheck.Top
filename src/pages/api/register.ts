import type { APIRoute } from "astro";
import { supabase } from "../../base";

export const POST: APIRoute = async ({ request, redirect }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const captchaToken = formData.get("h-captcha-response")?.toString();

    if (!email || !password || !captchaToken) {
        return new Response(`No ${!email ? "email" : !password ? "password" : "captcha token"} given`, { status: 400 });
    }

    const { error } = await supabase.auth.signUp({ email, password, options: { captchaToken } });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return redirect("/signin");
};
