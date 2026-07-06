import { defineConfig, envField } from "astro/config";
import preact from "@astrojs/preact";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  adapter: node({ mode: "standalone" }),
  env: {
    schema: {
      KCT_DATABASE_FILE: envField.string({ context: "server", access: "public", default: "./.dev.db" }),
      GIT_SHA: envField.string({ context: "server", access: "public", optional: true }),
      GIT_REF: envField.string({ context: "server", access: "public", optional: true }),
    },
  },
});
