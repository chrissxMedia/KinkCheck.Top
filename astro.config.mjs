import { defineConfig, envField } from "astro/config";
import preact from "@astrojs/preact";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
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
