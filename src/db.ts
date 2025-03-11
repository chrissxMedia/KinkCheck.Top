import { Template, db, desc, eq } from "astro:db";
import type { template } from "./base";

export async function getCurrentTemplate(id: string): Promise<template | null> {
    const templates = await db
        .select()
        .from(Template)
        .where(eq(Template.id, id))
        .orderBy(desc(Template.created_at), desc(Template.revision));
    return templates && templates.length ? templates[0] as template : null;
}
