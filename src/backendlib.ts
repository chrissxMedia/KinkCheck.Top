import { createClient, type User, AuthError, type UserMetadata, type PostgrestError } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import NodeCache from "node-cache";
import type { template, template_revision } from "./base";

type ValOrErr<V, E> = [V, null] | [null, E];

export const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
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

export const oauthOptions = { redirectTo: "http://localhost:4321/api/callback" };

export async function getUser({ cookies }: { cookies: AstroCookies }): Promise<[User | null, null] | [null, AuthError]> {
    const access_token = cookies.get("sb-access-token")?.value;
    const refresh_token = cookies.get("sb-refresh-token")?.value;
    if (!access_token || !refresh_token) {
        return [null, new AuthError("Not logged in", 400)];
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

export type Profile = { id: string, username: string, full_name: string, avatar_url: string };
const profileCache = new NodeCache({ stdTTL: 3600 });

export async function getProfile(user: { id: string, user_metadata: UserMetadata }): Promise<Profile> {
    const [profile, error] = await getProfileById(user.id);

    if (error) {
        console.log(error);
    }

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
        }
        profileCache.set(profile.id, profile);
        return profile;
    }
}

export async function updateProfile(profile: Partial<Profile> & { id: string }): Promise<PostgrestError | undefined> {
    const { data, error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id)
        .select<"*", Profile>()
        .single();

    if (error) {
        return error;
    }

    profileCache.set(data.id, data);
}

export async function getProfileByName(username: string): Promise<ValOrErr<Profile, PostgrestError>> {
    // TODO: consider just having a second cache for usernames
    const cached = profileCache.keys().filter((k) => profileCache.get<Profile>(k)?.username === username);

    if (cached.length === 1) {
        return [profileCache.get(cached[0])!, null];
    } else if (cached.length > 1) {
        profileCache.del(cached);
    }

    const { data, error } = await supabase.from("profiles").select<"*", Profile>().eq("username", username).single();
    if (error) {
        return [null, error];
    }

    profileCache.set(data.id, data);
    return [data, error];
}

export async function getProfileById(id: string): Promise<ValOrErr<Profile, PostgrestError>> {
    const cached = profileCache.get<Profile>(id);
    if (cached) {
        return [cached, null];
    }

    const { data, error } = await supabase.from("profiles").select<"*", Profile>().eq("id", id).single();
    if (error) {
        return [null, error];
    }

    profileCache.set(id, data);
    return [data, null];
}

export type Template = template & { revisions: template_revision[] };
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
    Promise<ValOrErr<template & template_revision, { message: string }>> {
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

const validAvatars: string[] = [];

export async function isAvatarValid(url: string): Promise<boolean> {
    if (validAvatars.includes(url)) return true;
    try {
        const valid = (await fetch(url)).ok;
        if (valid) validAvatars.push(url);
        return valid;
    } catch {
        return false;
    }
}
