import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
    // TODO: this can be done much better with a better redirect or maybe even not a redirect
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    return redirect("/");
};
