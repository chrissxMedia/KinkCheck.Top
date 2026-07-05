import { Check, dbFile } from "./config";
import { eq } from "drizzle-orm";
import type { check, template, template_revision } from "../base";
import { getEntry } from "astro:content";
import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";

export const db = drizzle(dbFile);
// TODO: create a backup before running migrations, when there is a new migration, etc
migrate(db, { migrationsFolder: "migrations" });
await db.insert(Check).values([
    {
        id: "test",
        template_id: "kcc",
        template_revision: "0.8",
        created_at: new Date("2025-03-11T08:34:00.000Z"),
        data: { "ratings": [[1, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0], [0, 0], [0], [0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0], [0, 0], [0], [0], [0], [0], [0, 0], [0], [0], [0], [0], [0], [0], [0, 0], [0, 0], [0], [0], [0, 0], [0, 0], [0], [0, 0], [0, 0], [0], [0], [0, 0]] },
    },
]).onConflictDoNothing();

export async function getTemplate(id: string): Promise<template | undefined> {
    return getEntry("templates", id)?.then(({ data }) => data);
}

export async function getCurrentTemplate(id: string): Promise<template & template_revision | null> {
    const t = await getTemplate(id);
    return t && t.revisions.length ? { ...t, ...t.revisions[0] } : null;
}

export async function getTemplateVersion(id: string, revision: string):
    Promise<template & template_revision | null> {
    const t = await getTemplate(id);
    if (!t) return null;
    const rs = t.revisions.filter((r) => r.revision === revision);
    return rs.length === 1 ? { ...t, ...rs[0] } : null;
}

export async function getCheck(id: string): Promise<check | null> {
    const checks = await db.select().from(Check).where(eq(Check.id, id));
    return checks && checks.length === 1 ? checks[0] as check : null;
}
