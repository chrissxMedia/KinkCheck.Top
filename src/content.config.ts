import { defineCollection } from 'astro:content';
import * as yaml from "js-yaml";
import { basename } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import type { template } from './base';

const tMeta: Partial<template>[] = [
  { id: "kcc", name: "Classic", type: "full" },
  { id: "april-fools", name: "AF", type: "full" },
  { id: "unhealthy-stimming", name: "(unhealthy) Stimming & Coping Mechanisms", type: "full" },
];

const templates = defineCollection({
  loader: async () => {
    return Promise.all(tMeta.map(async ({ id, name, type }) => {
      const files = await readdir(`templates/${id}`);
      const rs = await Promise.all(files.map((f) =>
        readFile(`templates/${id}/${f}`, "utf-8").then(yaml.load)
          .then(y => ({ revision: basename(f, ".yaml"), ...y as object })))) as any[];
      const revisions = rs.map(x => ({ created: new Date(x.created), ...x }))
        .toSorted((a, b) => b.created.getUTCMilliseconds() - a.created.getUTCMilliseconds());
      return { id, name, type, revisions } as template;
    }));
  },
});

export const collections = { templates };
