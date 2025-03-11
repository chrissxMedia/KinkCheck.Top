import { NOW, column, defineDb, defineTable } from "astro:db";

const Template = defineTable({
  columns: {
    id: column.text(),
    revision: column.text(),
    created_at: column.date({ default: NOW }),
    type: column.text(),
    name: column.text(),
    data: column.json(),
  },
  indexes: [
    { on: ["id", "revision"], unique: true },
  ],
});

const Check = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    template_id: column.text(),
    template_revision: column.text(),
    created_at: column.date({ default: NOW }),
    data: column.json(),
  },
  foreignKeys: [{
    columns: ["template_id", "template_revision"],
    references: () => [Template.columns.id, Template.columns.revision],
  }],
});

// https://astro.build/db/config
export default defineDb({
  tables: { Template, Check },
});
