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
