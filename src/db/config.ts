import { z } from "astro/zod";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { customType, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { checkData } from "../zod";

const date = customType<{ data: Date, driverData: string }>({
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

const refine = { created_at: z.date(), data: checkData };
export const checkSelectSchema = createSelectSchema(Check, refine);
export const checkInsertSchema = createInsertSchema(Check, refine);
export type check = z.infer<typeof checkSelectSchema>;
