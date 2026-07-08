import { z } from "astro/zod";
import { createSelectSchema } from "drizzle-orm/zod";
import { customType, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

export const validRating = z.union([
  z.literal(0), z.literal(1), z.literal(1.5), z.literal(2), z.literal(2.5),
  z.literal(3), z.literal(3.5), z.literal(4), z.literal(4.5), z.literal(5),
]);

export const checkData = z.object({ ratings: z.array(z.array(validRating).optional()) });
export type checkData = z.infer<typeof checkData>;

export const checkSelectSchema = createSelectSchema(Check, {
  created_at: z.date(),
  data: checkData,
});
export type check = z.infer<typeof checkSelectSchema>;
