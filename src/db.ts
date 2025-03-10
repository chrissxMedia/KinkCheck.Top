import { Template, db, eq } from "astro:db";
import type { template } from "./base";

export async function getCurrentTemplate(id: string): Promise<template | null> {
    const templates = await db
        .select()
        .from(Template)
        .where(eq(Template.id, id))
        .orderBy(Template.created_at, Template.revision);
    return templates && templates.length ? templates[0] as template : null;
}
