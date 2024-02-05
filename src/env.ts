export default { ...(import.meta as any).env, ...process.env } as {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly HCAPTCHA_SITEKEY: string;
};
