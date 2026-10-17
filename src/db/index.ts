import { type check, Check, checkSelectSchema } from "./config";
import { eq, type EmptyRelations } from "drizzle-orm";
import type { template, template_revision } from "../zod";
import { getEntry } from "astro:content";
import { drizzle, type NodeSQLiteDatabase } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { closeSync, existsSync, mkdtempSync, openSync, readSync, renameSync, rmSync } from "node:fs";
import { backup, DatabaseSync } from "node:sqlite";
import { KCT_DATABASE_FILE, GIT_SHA } from "astro:env/server";

function validBackup(file: string): boolean {
    let db: DatabaseSync | undefined;
    try {
        const fd = openSync(file, "r");
        try {
            const header = Buffer.alloc(16);
            // SQLite accepts zero-byte files as empty databases, even for integrity_check.
            if (readSync(fd, header, 0, header.length, 0) !== header.length ||
                header.toString() !== "SQLite format 3\0") return false;
        } finally {
            closeSync(fd);
        }
        db = new DatabaseSync(file, { readOnly: true });
        const result = db.prepare("PRAGMA integrity_check").all();
        return result.length === 1 && result[0].integrity_check === "ok";
    } catch (error) {
        if (error instanceof Error && (
            ("code" in error && error.code === "ENOENT") ||
            ("errcode" in error && (error.errcode === 11 || error.errcode === 26))
        )) return false;
        throw error;
    } finally {
        db?.close();
    }
}

async function openDb(): Promise<NodeSQLiteDatabase<EmptyRelations>> {
    const file = KCT_DATABASE_FILE;
    const existed = existsSync(file);
    const db = drizzle(file);
    db.$client.exec("PRAGMA busy_timeout = 5000");
    if (existed && GIT_SHA) {
        const backupFile = `${file}.${GIT_SHA.substring(0, 7)}.bak`;
        if (!validBackup(backupFile)) {
            const temporaryDir = mkdtempSync(`${backupFile}.`);
            const temporaryFile = `${temporaryDir}/backup.db`;
            try {
                await backup(db.$client, temporaryFile);
                if (!validBackup(temporaryFile)) throw new Error(`Invalid backup: ${temporaryFile}`);
                if (!validBackup(backupFile)) renameSync(temporaryFile, backupFile);
            } finally {
                rmSync(temporaryDir, { recursive: true, force: true });
            }
        }
    }
    db.$client.exec("PRAGMA journal_mode = WAL");
    migrate(db, { migrationsFolder: "migrations" });
    return db;
}

export const db = await openDb();
await db.insert(Check).values([
    {
        id: "test",
        template_id: "kcc",
        template_revision: "0.8",
        created_at: new Date("2026-08-03T12:34:00.000Z"),
        data: { "ratings": [[1, 1.5], [2, 2.5], [3, 3.5]] },
    },
]).onConflictDoNothing();

export async function getTemplate(id: string): Promise<template | null> {
    const e = await getEntry("templates", id);
    return e ? e.data : null;
}

/** Falsy revision resolves to the current (most recent) one. */
export async function getTemplateVersion(id: string, revision?: string | null):
    Promise<template & template_revision | null> {
    const t = await getTemplate(id);
    if (!t) return null;
    const rs = revision ? t.revisions.filter((r) => r.revision === revision) : t.revisions;
    return rs.length ? { ...t, ...rs[0] } : null;
}

export async function getCheck(id: string): Promise<check | null> {
    const checks = await db.select().from(Check).where(eq(Check.id, id));
    return checks.length ? checkSelectSchema.parse(checks[0]) : null;
}
