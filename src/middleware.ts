import { defineMiddleware } from "astro:middleware";
import type { APIContext } from "astro";
import { getActionContext } from "astro:actions";
import { GIT_REF } from "astro:env/server";
import { Address6 } from "ip-address";

const WINDOW_MS = 600_000;
const MAX_REQUESTS = 5;

const rateLimitMap = new Map<string, number[]>();
const firstBlockMap = new Map<string, number>();

function pruneStale<T>(map: Map<string, T>, stale: (v: T) => boolean) {
    for (const [key, value] of map) if (stale(value)) map.delete(key);
}

function compactRlMaps() {
    const now = Date.now();
    pruneStale(rateLimitMap, ts => ts.every(t => now - t >= WINDOW_MS));
    pruneStale(firstBlockMap, t => now - t >= WINDOW_MS);
}

function normalizeClientKey(raw: string): string {
    const addr = raw.toLowerCase();
    // IPv4-mapped IPv6: ::ffff:1.2.3.4 -> 1.2.3.4
    if (addr.startsWith("::ffff:")) return addr.slice("::ffff:".length);
    // Treat every /64 as the same IPv6
    if (Address6.isValid(addr)) return new Address6(addr + "/64").startAddress().correctForm();
    return addr;
}

type RateLimitResult = { ok: true; retryAfter?: undefined } | { ok: false; retryAfter: number };

function checkRateLimit(ip: string): RateLimitResult {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) ?? [];
    const windowed = timestamps.filter((t) => now - t < WINDOW_MS);
    const ok = windowed.length < MAX_REQUESTS;
    if (ok) windowed.push(now);
    rateLimitMap.set(ip, windowed);
    return ok ? { ok } : { ok, retryAfter: Math.ceil((windowed[0] + WINDOW_MS - now) / 1000) };
}

function logFirstBlock(key: string) {
    const now = Date.now();
    const last = firstBlockMap.get(key) ?? 0;
    if (now - last >= WINDOW_MS) {
        firstBlockMap.set(key, now);
        console.log("Rate limited: " + key);
    }
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { action } = getActionContext(context);

    if (action) {
        if (GIT_REF === "daddy") {
            return new Response("This feature is not available in prod yet.", { status: 400 });
        } else if (rateLimitMap.size > 100_000 || firstBlockMap.size > 100_000) {
            compactRlMaps();
        }
        const ip = context.request.headers.get("X-Real-IP")?.trim() || context.clientAddress;
        const key = normalizeClientKey(ip);
        const result = checkRateLimit(key);

        if (!result.ok) {
            logFirstBlock(key);
            return new Response("Only 5 action calls per 10 minutes allowed", {
                status: 429,
                headers: { "Retry-After": String(result.retryAfter) },
            });
        }

        console.log(`Action ${action.name} called from ${key} (${ip})`);
    }

    return next();
});
