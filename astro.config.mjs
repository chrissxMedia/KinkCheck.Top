import { defineConfig } from 'astro/config';

import preact from "@astrojs/preact";
import db from "@astrojs/db";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), db()],

  adapter: node({
    mode: "standalone"
  }),
});
