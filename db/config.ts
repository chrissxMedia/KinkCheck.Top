import { drizzle } from "drizzle-orm/node-sqlite";
import { customType, sqliteTable, text } from "drizzle-orm/sqlite-core";
import process from "node:process";

const date = customType<{data: Date, driverData: string}>({
  dataType: () => "text",
  toDriver: (d) => d.toISOString(),
  fromDriver: (d) => new Date(d),
});

export const Check = sqliteTable("checks", {
  id: text().primaryKey(),
  template_id: text().notNull(),
  template_revision: text().notNull(),
  created_at: date().notNull(),
  user_id: text(),
  data: text({ mode: "json" }).notNull(),
});

// not having a separate schema file is a bad idea ig, but this is temporary anyways
// also, the env name needs to be changed
export const dbFile = process.env.ASTRO_DATABASE_FILE ?? ".astro/thisshouldntbehere.db";
export const db = drizzle(dbFile);
