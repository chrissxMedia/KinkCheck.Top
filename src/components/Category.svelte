<script lang="ts">
    import Kink from "./Kink.svelte";
    import { type kink } from "../base";

    let {
        cat,
        kinks,
        ratings,
        setRating,
    }: {
        cat: string;
        kinks: kink[];
        ratings: number[][];
        setRating?: (k: number) => (p: number) => (r: number) => void;
    } = $props();
</script>

<div class="category">
    <h2 class="catname">{cat}</h2>
    <table class="table">
        <tbody>
            {#each kinks as kink, i}
                <Kink
                    {kink}
                    ratings={ratings[i]}
                    setRating={setRating && setRating(i)}
                />
            {/each}
        </tbody>
    </table>
</div>

<style>
    .table {
        border: 1px solid #303030;
        border-collapse: collapse;
        font-size: 1.35em;
    }

    .catname {
        margin-bottom: 0.25em;
        margin-top: 0.375em;
    }

    .category {
        min-width: 28%;
    }

    @media screen and (width <= 900px) {
        :global(body:not(.screenshot)) .category,
        :global(body:not(.screenshot)) .table {
            width: 100%;
        }
    }
</style>
