import { defineConfig } from 'astro/config';

import preact from "@astrojs/preact";
import db from "@astrojs/db";
import node from "@astrojs/node";
import svelte, { vitePreprocess } from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), db(), svelte({ preprocess: vitePreprocess() })],

  adapter: node({
    mode: "standalone"
  }),
});
