import { defineConfig } from "drizzle-kit";
import { dbFile } from "./db/config";

export default defineConfig({
  out: "migrations",
  schema: "db/config.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbFile,
  },
});
