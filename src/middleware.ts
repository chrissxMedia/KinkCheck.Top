import { defineMiddleware } from "astro:middleware";
import type { APIContext } from "astro";
import { getActionContext } from "astro:actions";
import { GIT_REF } from "astro:env/server";
import { Address6 } from "ip-address";

const rateLimitMap = new Map<string, number[]>();

function compactRlMap() {
    const now = Date.now();
    rateLimitMap.entries().toArray()
        .filter(([, ts]) => !ts.filter(t => now - t < 600_000).length)
        .forEach(([ip]) => rateLimitMap.delete(ip));
}

function normalizeClientKey(raw: string): string {
    const addr = raw.toLowerCase();
    // IPv4-mapped IPv6: ::ffff:1.2.3.4 -> 1.2.3.4
    if (addr.startsWith("::ffff:")) return addr.slice("::ffff:".length);
    // Treat every /64 as the same IPv6
    if (Address6.isValid(addr)) return new Address6(addr + "/64").startAddress().correctForm();
    return addr;
}

function getClientKey(context: APIContext): string {
    const forwarded = context.request.headers.get("X-Real-IP")?.trim();
    return normalizeClientKey(forwarded || context.clientAddress);
}

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) ?? [];
    const windowed = timestamps.filter((t) => now - t < 600_000);
    const ok = windowed.length < 5;
    if (ok) windowed.push(now);
    rateLimitMap.set(ip, windowed);
    if (rateLimitMap.size > 100_000) compactRlMap();
    return ok;
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { action } = getActionContext(context);

    if (action) {
        const key = getClientKey(context);
        console.log(`Action ${action.name} called from ${key}`);
        if (GIT_REF === "daddy") {
            return new Response("This feature is not available in prod yet.", { status: 400 });
        }
        if (!checkRateLimit(key)) {
            console.log(`Rate limited: ${key} (${context.clientAddress})`);
            return new Response("Only 5 action calls per 10 minutes allowed", { status: 429 });
        }
    }

    return next();
});
