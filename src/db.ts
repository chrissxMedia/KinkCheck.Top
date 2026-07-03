import { Check, db } from "../db/config";
import { eq } from "drizzle-orm";
import type { check, template } from "./base";
import { templates as hardcodedTemplates } from "../db/seed";

export async function getTemplate(id: string): Promise<template[] | null> {
    const templates = hardcodedTemplates
        .filter(t => t.id === id)
        .toSorted((a, b) => b.created_at.getUTCMilliseconds() - a.created_at.getUTCMilliseconds());
    return templates;
}

export async function getCurrentTemplate(id: string): Promise<template | null> {
    const templates = await getTemplate(id);
    return templates && templates.length ? templates[0] : null;
}

export async function getTemplateVersion(id: string, revision: string):
    Promise<template | null> {
    const templates = hardcodedTemplates
        .filter(t => t.id === id && t.revision === revision);
    return templates.length === 1 ? templates[0] as template : null;
}

export async function getCheck(id: string): Promise<check | null> {
    const checks = await db.select().from(Check).where(eq(Check.id, id));
    return checks && checks.length === 1 ? checks[0] as check : null;
}
