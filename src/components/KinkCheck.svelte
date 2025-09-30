<script lang="ts">
    import Category from "./Category.svelte";
    import {
        decodeKinkCheck,
        defaultKinkcheck,
        encodeKinkCheck,
        type kinkcheck,
        type template_revision,
    } from "../base";

    let meta: template_revision & {
        init?: kinkcheck;
        store?: string;
        readonly?: boolean;
    } = $props();

    if (!meta.init) {
        const saved = meta.store && window.localStorage.getItem(meta.store);
        meta.init = saved
            ? decodeKinkCheck(meta, JSON.parse(saved))
            : defaultKinkcheck(meta.kinks);
    }
    let ratings = $state(meta.init!.ratings);
    const setRating =
        (cat: number) => (kink: number) => (pos: number) => (rat: number) => {
            const r = [...ratings!];
            r[cat][kink][pos] = rat;
            ratings = r;
            if (meta.store) {
                window.localStorage.setItem(
                    meta.store,
                    JSON.stringify(encodeKinkCheck(meta, { ratings: r })),
                );
            }
        };
</script>

<main class="catcontainer">
    {#each meta.kinks as [cat, kinks], i}
        <Category
            cat={cat}
            kinks={kinks}
            ratings={ratings[i]}
            setRating={meta.readonly ? undefined : setRating(i)}
        />
    {/each}
</main>

<style>
    .catcontainer {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        column-gap: 2ch;
    }
</style>
