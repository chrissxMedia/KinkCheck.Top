import type { APIRoute } from "astro";
import { getUser, supabase, updateProfile } from "../../../backendlib";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const username = formData.get("username")?.toString();
    const full_name = formData.get("full_name")?.toString();
    const avatar_url = formData.get("avatar_url")?.toString();

    const [user, error] = await getUser({ cookies });

    if (error) {
        return new Response(error.message, { status: error.status ?? 500 });
    }

    const { error: err } = await supabase.auth.updateUser({ email });

    if (err) {
        return new Response(err.message, { status: err.status ?? 500 });
    }

    const e = await updateProfile({ id: user!.id, username, full_name, avatar_url });

    if (e) {
        return new Response(e.message, { status: 500 });
    }

    return redirect("/settings?changed");
};
