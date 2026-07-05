import { defineConfig } from "drizzle-kit";
import { dbFile } from "./src/db/config";

export default defineConfig({
  out: "migrations",
  schema: "src/db/config.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbFile,
  },
});
