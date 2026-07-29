import { type check, Check, checkSelectSchema } from "./config";
import { eq, type EmptyRelations } from "drizzle-orm";
import type { template, template_revision } from "../zod";
import { getEntry } from "astro:content";
import { drizzle, type NodeSQLiteDatabase } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { copyFileSync, existsSync } from "node:fs";
import { KCT_DATABASE_FILE, GIT_SHA } from "astro:env/server";

function openDb(): NodeSQLiteDatabase<EmptyRelations> {
    const file = KCT_DATABASE_FILE;
    if (existsSync(file) && GIT_SHA) {
        const backup = `${file}.${GIT_SHA.substring(0, 7)}.bak`;
        if (!existsSync(backup)) copyFileSync(file, backup);
    }
    const db = drizzle(file);
    migrate(db, { migrationsFolder: "migrations" });
    return db;
}

export const db = openDb();
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
    return rs.length ? { ...t, ...rs[0] } : null;
}

export async function getCheck(id: string): Promise<check | null> {
    const checks = await db.select().from(Check).where(eq(Check.id, id));
    return checks.length ? checkSelectSchema.parse(checks[0]) : null;
}
