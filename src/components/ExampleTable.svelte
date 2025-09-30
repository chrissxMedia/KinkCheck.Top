<script lang="ts">
    import Kink from "./Kink.svelte";
    import { type kink } from "../base";

    let { kinks }: { kinks: kink[] } = $props();
    let ratings = $state(
        kinks.map(([, positions]) => positions.map(() => 0)),
    );
    const setRating = (kink: number) => (pos: number) => (rat: number) => {
        const p = ratings[kink];
        p[pos] = rat;
        const r = ratings;
        r[kink] = p;
        console.log(r);
        ratings = r;
        // TODO: try to not copy
    };
</script>

<table class="table">
    <tbody>
        {#each kinks as kink, i}
            <Kink {kink} ratings={ratings[i]} setRating={setRating(i)} />
        {/each}
    </tbody>
</table>

<style>
    .table {
        border: 1px solid #303030;
        border-collapse: collapse;
        font-size: 1.35em;
    }
</style>
