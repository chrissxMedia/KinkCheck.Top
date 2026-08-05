import { z } from "astro/zod";

export const positions = z.union([z.tuple([z.literal("")]), z.tuple([z.string(), z.string()])]);
export type positions = z.infer<typeof positions>;

export const kink = z.tuple([z.string(), positions, z.number(), z.string()]);
export type kink = z.infer<typeof kink>;

export const kinklist = z.array(z.tuple([z.string(), z.array(kink)]));
export type kinklist = z.infer<typeof kinklist>;

export const template_revision = z.object({
    revision: z.string(),
    created: z.date(),
    kinks: kinklist,
});
export type template_revision = z.infer<typeof template_revision>;
export type TRData = Pick<template_revision, "kinks">;

export const template = z.object({
    id: z.string(),
    name: z.string(),
    type: z.literal("full"),
    revisions: z.array(template_revision),
});
export type template = z.infer<typeof template>;

export const validRating = z.union([
    z.literal(0), z.literal(1), z.literal(1.5), z.literal(2), z.literal(2.5),
    z.literal(3), z.literal(3.5), z.literal(4), z.literal(4.5), z.literal(5),
]);
export type validRating = z.infer<typeof validRating>;

export const checkData = z.object({ ratings: z.array(z.array(validRating).nullish()) });
export type checkData = z.infer<typeof checkData>;
