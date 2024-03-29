import { createClient, type User, type AuthError, type UserMetadata, type PostgrestError } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import NodeCache from "node-cache";
import type { Check, Template, TemplateRevision, check, check_data, check_revision, template, template_revision } from "./base";
import env from "./env";

type ValOrErr<V, E> = [V, null] | [null, E];

export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    { auth: { flowType: "pkce" } }
);

export const authProviders: [string, string][] = [
    //["google", "Google"],
    ["discord", "Discord"],
    ["twitch", "Twitch"],
    ["spotify", "Spotify"],
    ["slack", "Slack"],
    ["github", "GitHub"],
    ["gitlab", "GitLab"],
];

export const oauthOptions = { redirectTo: "http://localhost:4321/api/user/callback" };

export async function getUser({ cookies }: { cookies: AstroCookies }): Promise<ValOrErr<User | null, AuthError>> {
    // TODO: consider { cookies, clientAddress }: { cookies: AstroCookies, clientAddress: string } for rate limiting
    const access_token = cookies.get("sb-access-token")?.value;
    const refresh_token = cookies.get("sb-refresh-token")?.value;
    if (!access_token || !refresh_token) {
        return [null, null];
    }
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
        console.warn(error);
        cookies.delete("sb-access-token", { path: "/" });
        cookies.delete("sb-refresh-token", { path: "/" });
        return [null, error];
    }
    return [data.user, null];
}

// TODO: consider putting in base
export type Profile = { id: string, username: string, full_name: string, avatar_url: string };
const profileCache = new NodeCache({ stdTTL: 3600 });
const usernameCache = new NodeCache({ stdTTL: 3600 });

export async function getProfile(user: { id: string, user_metadata: UserMetadata }): Promise<Profile> {
    const [profile, error] = await getProfileById(user.id);
    if (error) console.log(error);

    if (profile) {
        return profile;
    } else {
        const m = user.user_metadata;
        // TODO: we should try to check
        const username = m.username ?? m.user_name ?? m.preferred_username ?? m.nickname ?? m.name ?? m.slug ?? user.id;
        const profile: Profile = {
            id: user.id,
            avatar_url: m.avatar_url ?? m.picture,
            full_name: m.full_name ?? username,
            username,
        };
        const { error } = await supabase.from("profiles").insert<Profile>(profile);
        if (error) {
            console.warn(error);
            // TODO: consider not returning the profile
            // (leads to having to handle a lot more edge-cases, but also ensures consistency)
        } else {
            profileCache.set(profile.id, profile);
            usernameCache.set(profile.username, profile.id);
        }
        return profile;
    }
}

// TODO: consider returning the new profile
export async function updateProfile(profile: Partial<Profile> & { id: string }): Promise<PostgrestError | undefined> {
    const { data, error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id)
        .select<"*", Profile>()
        .single();
    if (error) return error;

    profileCache.set(data.id, data);
    usernameCache.set(data.username, data.id);
}

export async function getUserIdByName(username: string): Promise<ValOrErr<string, PostgrestError>> {
    const cached = usernameCache.get<string>(username);
    if (cached) return [cached, null];

    const { data, error } = await supabase.from("profiles").select<"*", Profile>().eq("username", username).single();
    if (error) return [null, error];

    profileCache.set(data.id, data);
    usernameCache.set(username, data.id);
    return [data.id, null];
}

export async function getProfileById(id: string): Promise<ValOrErr<Profile, PostgrestError>> {
    const cached = profileCache.get<Profile>(id);
    if (cached) return [cached, null];

    const { data, error } = await supabase.from("profiles").select<"*", Profile>().eq("id", id).single();
    if (error) return [null, error];

    profileCache.set(id, data);
    usernameCache.set(data.username, id);
    return [data, null];
}

const templateCache = new NodeCache({ stdTTL: 3600 });

export async function getTemplateById(id: string): Promise<ValOrErr<Template, PostgrestError>> {
    const cached = templateCache.get<Template>(id);
    if (cached) {
        return [cached, null];
    }

    const { data: template, error } = await supabase.from("templates").select<"*", template>().eq("id", id).single();
    if (error) {
        return [null, error];
    }

    // TODO: reconsider how we cache revisions as they can have inf ttl
    const { data: revisions, error: err } = await supabase.from("template_revisions").select<"*", template_revision>().eq("id", id);
    if (err) {
        return [null, err];
    }

    const t = { ...template, revisions };
    templateCache.set(id, t);
    return [t, null];
}

export async function getTemplateRevision({ id, version }: { id: string, version: string }):
    Promise<ValOrErr<TemplateRevision, { message: string }>> {
    const [template, error] = await getTemplateById(id);

    if (error) {
        return [null, error];
    }

    const revision =
        version === "latest"
            ? template.revisions.toSorted((a, b) =>
                a.created > b.created ? -1 : a.created === b.created ? 0 : 1,
            )[0]
            : template.revisions.find((r) => r.version === version);

    if (!revision) {
        return [null, { message: "unknown version" }];
    }

    return [{ ...template, ...revision }, null];
}

// FIXME: this completely fucks up visibility
const checkCache = new NodeCache({ stdTTL: 3600 });

// TODO: all kinds of caching (we just need to redo like all the caching lmao)
export async function getAllChecksByUser(user: string): Promise<ValOrErr<Check[], PostgrestError>> {
    const { data: checks, error } = await supabase
        .from("checks")
        .select<"*", check>()
        .eq("user_id", user);
    if (error) return [null, error];

    const results = await Promise.all(checks.map(check => supabase
        .from("check_revisions")
        .select<"*", check_revision>()
        .eq("user_id", user)
        .eq("template", check.template)
        .order("modified")));
    const err = results.find(({ error }) => error)?.error;
    if (err) return [null, err];

    const revs = results.map(({ data }) => data!);
    const full_checks: Check[] = checks.map((check, i) => ({ ...check, revisions: revs[i] }));

    return [full_checks, null];
}

export async function getCheck({ user, template }: { user: string, template: string }): Promise<ValOrErr<Check, PostgrestError>> {
    const key = `${user}/${template}`;
    const cached = checkCache.get<Check>(key);
    if (cached) return [cached, null];

    const { data: check, error } = await supabase
        .from("checks")
        .select<"*", check>()
        .eq("user_id", user)
        .eq("template", template)
        .single();
    if (error) return [null, error];

    // TODO: reconsider how we cache revisions as they can have inf ttl once finished (but that isn't in rls yet!!)
    const { data: revisions, error: err } = await supabase
        .from("check_revisions")
        .select<"*", check_revision>()
        .eq("user_id", user)
        .eq("template", template)
        .order("modified");
    if (err) return [null, err];

    const c = { ...check, revisions };
    checkCache.set(key, c);
    return [c, null];
}

export async function getOwnCheck({ cookies }: { cookies: AstroCookies }, template: string):
    Promise<ValOrErr<Check | null, AuthError | PostgrestError>> {
    const [user, error] = await getUser({ cookies });
    if (!user) return [null, error];
    return getCheck({ user: user.id, template });
}

export function getLatestCheckRevision(check: Check): check & check_revision | null {
    if (!check.revisions.length) return null;
    return {
        ...check,
        ...check.revisions.toSorted(({ modified: a }, { modified: b }) => a < b ? 1 : a > b ? -1 : 0)[0]
    };
}

export function createCheckMeta(check: check): PromiseLike<PostgrestError | null> {
    return supabase.from("checks").insert<check>(check).then(({ error }) => error);
}

export async function createCheckRevision({ user, template, version, data }:
    { user: string, template: string, version: string, data: check_data }):
    Promise<PostgrestError | null> {
    const { error } = await supabase
        .from("check_revisions")
        .insert<check_revision>({ user_id: user, template, version, modified: new Date().toISOString(), data });
    // TODO: try to update the cache
    checkCache.del(`${user}/${template}`);
    return error;
}

export async function updateCheckRevision({ user, template, version, data, oldDate }:
    { user: string, template: string, version: string, data: check_data, oldDate: Date }):
    Promise<PostgrestError | null> {
    const { error } = await supabase
        .from("check_revisions")
        .update<Partial<check_revision>>({ version, modified: new Date().toISOString(), data })
        .eq("user_id", user)
        .eq("template", template)
        .eq("modified", oldDate)
        .single();
    // TODO: try to update the cache
    checkCache.del(`${user}/${template}`);
    return error;
}

const validAvatars = new NodeCache({ stdTTL: 3600 });

export async function isAvatarValid(url: string): Promise<boolean> {
    const cached = validAvatars.get<boolean>(url);
    if (cached !== undefined) return cached;
    try {
        const valid = (await fetch(url)).ok;
        validAvatars.set(url, valid);
        return valid;
    } catch {
        validAvatars.set(url, false);
        return false;
    }
}
