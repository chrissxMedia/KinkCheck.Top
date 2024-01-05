import type { AstroCookies } from "astro";
import { AuthError, createClient, type PostgrestError, type User, type UserMetadata } from "@supabase/supabase-js";

export const ratings: [string, string][] = [
    ["i dont know", "#d0d0d0"],
    ["favorite", "#00e0e0"],
    ["want to do", "#00c020"],
    ["could be convinced", "#eeee20"],
    ["not interested", "#d02000"],
    ["hard limit", "#303030"],
];

export type positions = [string, string] | [""];
export type kink = [string, positions, number] | [string, positions, number, string];
export type kinklist = { [k: string]: kink[] };
export type metadata = { kinks: kinklist, version: string };

export const kinks: kinklist = {
    "General": [
        ["Fellatio/Blowjobs", ["receive", "give"], 0],
        ["Cunnilingus", ["receive", "give"], 1, "giver licks receiver's vagina"],
        ["Face-Fucking", ["give", "receive"], 2],
        ["Face-Sitting", ["top", "bottom"], 3, "top sits on bottom's face"],
        ["Handjobs", ["give", "receive"], 4],
        ["Vaginal Penetration", ["top", "bottom"], 98],
        ["Vaginal Fingering", ["give", "receive"], 5],
        ["Vaginal Fisting", ["give", "receive"], 6],
        ["Rough Sex", [""], 7],
        ["Creampie", ["give", "receive"], 8, "giver cums in receiver's ass or vagina"],
        ["Swallowing", ["top", "bottom"], 9],
        ["Facials", ["give", "receive"], 10, "giver cums on receiver's face"],
        ["Masturbation", ["top", "anal/…"], 11],
        ["Anal Penetration", ["top", "bottom"], 12],
        ["Anal Fingering", ["top", "bottom"], 13],
        ["Anal Fisting", ["top", "bottom"], 14],
        ["Pegging", ["top", "bottom"], 15, "top anally penetrates bottom with a strap-on"],
        ["Anilingus/Rimming", ["receive", "give"], 16, "bottom licks top's asshole"],
    ],
    "BDSM": [
        ["Little/Daddy*Mommy", ["dom", "sub"], 17],
        ["Slave/Master*Mistress", ["dom", "sub"], 18],
        ["Pet/Owner", ["dom", "sub"], 19],
        ["Power Exchange (24/7)", ["dom", "sub"], 22, "dom controls aspects of sub's everyday life"],
        ["Humiliation/Embarrassment", ["dom", "sub"], 23],
        ["Degradation/Name Calling", ["dom", "sub"], 24],
        ["Bondage", ["dom", "sub"], 25, "dom ties sub up"],
        ["Encasement/Cages", ["dom", "sub"], 26],
        ["Discipline", ["dom", "sub"], 27],
        ["Rape/CNC", ["top", "bottom"], 28],
        ["Kidnapping", ["dom", "sub"], 29],
        ["Spanking", ["give", "receive"], 30],
        ["Forced Orgasms", ["give", "receive"], 31],
        ["Orgasm Denial", ["dom", "sub"], 32],
        ["Chastity", ["dom", "sub"], 33],
        ["Masturbation Instructions", ["give", "receive"], 34],
        ["Servitude", ["dom", "sub"], 35],
        ["Sensation Play", ["dom", "sub"], 36],
        ["Electric Stimulation", ["dom", "sub"], 37],
        ["Breathing Play", ["dom", "sub"], 38, "dom restricts sub's breathing"],
        ["Choking", ["dom", "sub"], 39],
        ["Gags", ["dom", "sub"], 40],
        ["Begging", ["dom", "sub"], 41],
        ["Teasing", ["dom", "sub"], 42],
        ["Sounding/Urethral Insertion", ["dom", "sub"], 43],
        ["Worship", ["dom", "sub"], 44],
    ],
    "Kinks": [
        ["Incest", ["cousins", "siblings"], 45],
        ["Incest (any age)", ["parents", "children"], 46],
        ["Impregnation/Pregnancy", ["top", "bottom"], 47],
        // TODO: rename big time
        ["Milking", ["dom", "sub"], 48],
        ["Nursing", ["dom", "sub"], 49, "dom \"breast-feeds\" sub"],
        ["Feet", [""], 50],
        ["Pee", ["dom", "sub"], 51],
        ["Roleplay", [""], 52],
        ["Diapers/ABDL", [""], 53],
        ["Cheating/Cuckold/NTR", ["dom", "sub"], 54],
        ["Feminization/Sissy", ["dom", "sub"], 55],
        ["Exhibition/Voyeur", ["exhib", "voyeur"], 56],
        ["Double-Penetration", ["top", "bottom"], 57],
        ["Multi-Partner", ["top", "bottom"], 58],
        ["Tickling", ["dom", "sub"], 59],
        ["Cumswapping", [""], 60],
        ["Thighsex", ["top", "bottom"], 61],
        ["Titfuck", ["top", "bottom"], 62],
        ["Footjob", ["give", "receive"], 63],
        ["Armpit Sex", ["top", "bottom"], 64],
    ],
    "Pain": [
        ["Physical Pain", ["give", "receive"], 65],
        ["Nipple Clamps", ["give", "receive"], 66],
        ["Hard Spanking", ["give", "receive"], 67],
        ["Whipping", ["give", "receive"], 68],
        ["Slapping", ["give", "receive"], 69],
        ["Biting", ["give", "receive"], 70],
        ["Hot Wax", ["give", "receive"], 71],
        ["Scratching", ["give", "receive"], 72],
        ["Cock/Ball Slapping", ["give", "receive"], 73],
        ["Vagina Slapping", ["give", "receive"], 74],
        ["Clothespins", ["give", "receive"], 75],
        ["Needles", ["give", "receive"], 76],
    ],
    "Clothing": [
        ["Clothed Sex", [""], 77],
        ["Collars", ["dom", "sub"], 78, "sub wears a collar, which might have a leash for dom to pull on"],
        ["Latex", [""], 79],
        ["Lingerie", [""], 80],
        ["Stockings/Pantyhose", [""], 81],
        ["Crossdressing", [""], 82],
        ["Forced Dressup", ["dom", "sub"], 83],
        ["Leather", [""], 84],
        ["Socks", [""], 85],
        ["Uniforms", [""], 86],
        ["Cosplay", [""], 87],
        ["Furry", [""], 88],
    ],
    "Extreme": [
        ["Scat", [""], 89],
        ["Cutting", ["give", "receive"], 90],
        ["Raceplay", ["dom", "sub"], 91],
        ["Bestiality", [""], 92],
        ["Necrophilia", [""], 93],
        ["Hard Rape", ["top", "bottom"], 94],
        ["Children", [""], 95],
        ["Blood", [""], 96],
        ["Cannibalism", ["dom", "sub"], 97],
        ["Torture", ["dom", "sub"], 20],
        ["Genital Mutilation", ["give", "receive"], 21],
    ],
};

const valueForAllKinks = <T>(kinks: kinklist, x: T) => Object.fromEntries(
    Object.entries(kinks).map<[string, T[][]]>(
        ([cat, kinks]) => [cat, kinks.map((k) => k[1].map(() => x))])
);

export type ratings = { [k: string]: number[][] };
export const defaultRatings = (kinks: kinklist): ratings => valueForAllKinks(kinks, 0);
export type checklist = { [k: string]: boolean[][] };
export const defaultChecklist = (kinks: kinklist): checklist => valueForAllKinks(kinks, false);
export type kinkcheck = { ratings: ratings };
export const defaultKinkcheck = (kinks: kinklist): kinkcheck => { return { ratings: defaultRatings(kinks) } };

function packIndexedValues<T>(indexedValues: [number, T][]): T[] {
    return indexedValues.reduce<T[]>((arr, [idx, val]) => {
        arr[idx] = val;
        return arr;
    }, Array(Math.max(...indexedValues.map(([idx]) => idx))));
}

export function encodeKinkCheck({ kinks, version }: metadata, { ratings }: kinkcheck): string {
    const p = packIndexedValues(
        Object.entries(kinks).flatMap(([, kinks]) => kinks
            .map<[number, boolean]>(([, pos, id]) => [id, pos.length === 2])));
    const r = packIndexedValues(Object.entries(ratings)
        .flatMap(([cat, rats]) => kinks[cat].map<[number, number[]]>(([, , id], i) => [id, rats[i]])));
    return JSON.stringify({ version, ratings: r });
}

export function decodeKinkCheck({ kinks, version }: metadata, s: string): kinkcheck {
    const x = JSON.parse(s);
    if (x.version !== version)
        throw "unsupported kinkcheck serialization version";
    const ratings = defaultRatings(kinks);
    x.ratings.forEach((rat: number[], id: number) => {
        Object.keys(ratings).forEach((cat) => {
            ratings[cat].forEach((_, i) => {
                if (kinks[cat][i][2] === id) {
                    ratings[cat][i] = rat;
                }
            });
        });
    });
    return { ratings };
}

export const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    { auth: { flowType: "pkce" } }
);

export const authProviders: [string, string][] = [
    ["github", "GitHub"],
    ["discord", "Discord"],
    ["twitch", "Twitch"],
    ["spotify", "Spotify"],
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
const profileCache: { [id: string]: Profile & { ttl: Date } } = {};
function getCachedProfile(id: string): Profile | undefined {
    const cachedProfile = profileCache[id];
    if (cachedProfile && cachedProfile.ttl > new Date()) {
        return cachedProfile;
    }
}
function setCachedProfile(profile: Profile) {
    profileCache[profile.id] = { ttl: new Date(Date.now() + 1000 * 60 * 60), ...profile };
}

export async function getProfile(user: { id: string, user_metadata: UserMetadata }): Promise<Profile> {
    const { data, error } = await getProfileById(user.id);

    if (error) {
        console.log(error);
    }

    if (data) {
        return data;
    } else {
        const m = user.user_metadata;
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
        setCachedProfile(profile);
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

    setCachedProfile(data);
}

export async function getProfileByName(username: string): Promise<{ data: Profile | null, error: PostgrestError | null }> {
    const cached = Object.values(profileCache).filter((x) => x.ttl > new Date()).filter((x) => x.username === username);

    if (cached.length === 1) {
        return { data: cached[0], error: null };
    } else if (cached.length > 1) {
        cached.forEach(({ id }) => delete profileCache[id]);
    }

    const res = await supabase.from("profiles").select<"*", Profile>().eq("username", username).single();

    if (res.data && !res.error) {
        setCachedProfile(res.data);
    }

    return res;
}

export async function getProfileById(id: string): Promise<{ data: Profile | null, error: PostgrestError | null }> {
    const cached = getCachedProfile(id);

    if (cached) {
        return { data: cached, error: null };
    }

    const res = await supabase.from("profiles").select<"*", Profile>().eq("id", id).single();

    if (res.data && !res.error) {
        setCachedProfile(res.data);
    }

    return res;
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
