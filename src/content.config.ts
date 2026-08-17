import { defineCollection } from "astro:content";
import * as yaml from "js-yaml";
import { basename } from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { type kinklist, template } from "./zod";

const tMeta: Pick<template, "id" | "name" | "type">[] = [
  { id: "kcc", name: "Classic", type: "full" },
  { id: "april-fools", name: "AF", type: "full" },
  { id: "unhealthy-stimming", name: "(unhealthy) Stimming & Coping Mechanisms", type: "full" },
];

const fixKinks = (ks: any[]): kinklist => ks.map(([cat, kinks]: any[]) => [cat,
  kinks.map(([kink, pos, id, desc]: [string, string[], number | number[], string | undefined]) =>
    [kink, pos && pos.length ? pos : [""], typeof id === "number" ? [id] : id, desc ?? ""])]);

const templates = defineCollection({
  loader: async () => {
    return Promise.all(tMeta.map(async ({ id, name, type }) => {
      const files = await readdir(`templates/${id}`);
      const rs = await Promise.all(files.map((f) =>
        readFile(`templates/${id}/${f}`, "utf-8").then<any>(yaml.load)
          .then(y => ({ revision: basename(f, ".yaml"), created: new Date(y.created), kinks: fixKinks(y.kinks) }))));
      return { id, name, type, revisions: rs.toSorted((a, b) => b.created.getTime() - a.created.getTime()) };
    }));
  },
  schema: template,
});

export const collections = { templates };
