import { Check, Template, and, db, desc, eq } from "astro:db";
import type { check, template } from "./base";
import { templates as hardcodedTemplates } from "../db/seed";

let dbInitialized = false;

async function ensureDbInitialized(): Promise<void> {
    if (dbInitialized) return;
    const templates = await db.select().from(Template) as template[];
    dbInitialized = hardcodedTemplates.every((hct) => templates
        .some((dbt) => hct.id === dbt.id && hct.revision === dbt.revision));
    if (!dbInitialized) {
        await db.insert(Template).values(hardcodedTemplates.filter((hct) =>
            !templates.some((dbt) => dbt.id === hct.id && dbt.revision === hct.revision)));
        dbInitialized = true;
    }
}

export async function getTemplate(id: string): Promise<template[] | null> {
    await ensureDbInitialized();
    const templates = await db
        .select()
        .from(Template)
        .where(eq(Template.id, id))
        .orderBy(desc(Template.created_at), desc(Template.revision));
    return templates ? templates as template[] : null;
}

export async function getCurrentTemplate(id: string): Promise<template | null> {
    const templates = await getTemplate(id);
    return templates && templates.length ? templates[0] : null;
}

export async function getTemplateVersion(id: string, revision: string):
    Promise<template | null> {
    await ensureDbInitialized();
    const templates = await db
        .select()
        .from(Template)
        .where(and(eq(Template.id, id), eq(Template.revision, revision)));
    return templates && templates.length === 1 ? templates[0] as template : null;
}

export async function getCheck(id: string): Promise<check | null> {
    await ensureDbInitialized();
    const checks = await db.select().from(Check).where(eq(Check.id, id));
    return checks && checks.length === 1 ? checks[0] as check : null;
}
