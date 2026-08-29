import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "migrations",
  schema: "src/db/config.ts",
  dialect: "sqlite",
});
