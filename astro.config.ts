import { defineConfig, envField } from "astro/config";
import preact from "@astrojs/preact";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://KinkCheck.Top",
  integrations: [preact()],
  // Keep the content data-store in the project .astro so `astro sync` (build mode)
  // and vitest (dev mode, root/.astro) read the same store instead of sync writing
  // to node_modules/.astro while tests read an empty root/.astro.
  cacheDir: "./.astro",
  adapter: node({ mode: "standalone", bodySizeLimit: 1024 * 1024 /* 1 MiB is plenty for now */ }),
  env: {
    schema: {
      KCT_DATABASE_FILE: envField.string({ context: "server", access: "public", default: "./.dev.db" }),
      GIT_SHA: envField.string({ context: "server", access: "public", optional: true }),
      GIT_REF: envField.string({ context: "server", access: "public", optional: true }),
    },
  },
  prerenderConflictBehavior: "error",
  security: {
    csp: {
      directives: [
        "font-src https://fonts.chrissx.de https://fonts.gstatic.com https://db.onlinewebfonts.com",
        "frame-src https://w.soundcloud.com",
      ],
      styleDirective: {
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "https://fonts.chrissx.de", kind: "element" },
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
    },
  },
});
