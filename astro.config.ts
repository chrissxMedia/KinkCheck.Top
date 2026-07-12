import { defineConfig, envField } from "astro/config";
import preact from "@astrojs/preact";
import node from "@astrojs/node";
import alpinejs from "@astrojs/alpinejs";
import gendarme from "./src/gendarme";

function scopedJs() {
  return {
    name: "gendarme-scoping",
    transform(code: string, file: string) {
      if (!file.includes(".astro") || !file.includes("type=script")) return null;
      if (!code.includes("gendarme(")) return null;

      let transformed = false;
      const result = code.replace(
        /gendarme\(("[^"]*"|'[^']*'),/g,
        (_match, idQuoted: string) => {
          const scopeName = gendarme(idQuoted.slice(1, -1), file);
          transformed = true;
          return `gendarme.applyBind("${scopeName}",`;
        },
      );
      if (!transformed) return null;
      return { code: result, map: null };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://KinkCheck.Top",
  integrations: [preact(), alpinejs()],
  adapter: node({ mode: "standalone", bodySizeLimit: 1024 * 1024 /* 1 MiB is plenty for now */ }),
  vite: { plugins: [scopedJs()] },
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
