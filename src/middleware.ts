import { defineMiddleware } from "astro:middleware";
import { getActionContext } from "astro:actions";
import { GIT_REF } from "astro:env/server";

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) ?? [];
    const windowed = timestamps.filter((t) => now - t < 600_000);
    const ok = windowed.length < 5;
    if (ok) windowed.push(now);
    rateLimitMap.set(ip, windowed);
    return ok;
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { action } = getActionContext(context);

    if (action) {
        console.log(`Action ${action.name} called from ${context.clientAddress}`);
        if (GIT_REF === "daddy") {
            return new Response("This feature is not available in prod yet.", { status: 400 });
        }
        // NOTE: bottom deployment will show whether this actually works as expected
        if (!checkRateLimit(context.clientAddress)) {
            console.log("Rate limited: " + context.clientAddress);
            return new Response("Only 5 action calls per 10 minutes allowed", { status: 429 });
        }
    }

    return next();
});
