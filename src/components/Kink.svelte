<script lang="ts">
    import Rater from "./Rater.svelte";
    import { type kink } from "../base";

    let {
        kink,
        ratings,
        setRating,
    }: {
        kink: kink;
        ratings: number[];
        setRating?: (p: number) => (r: number) => void;
    } = $props();
</script>

<tr class="tr">
    <td class="td">
        <span>{kink[0]}</span>
        {#if kink[3]}
            <span class="desc">{kink[3]}</span>
        {/if}
    </td>
    {#each kink[1] as pos, p}
        <td class="td">
            <Rater
                text={pos}
                rating={ratings[p]}
                setRating={setRating && setRating(p)}
                clickable={!!setRating}
            />
        </td>
    {/each}
    {#if kink[1].length === 1}
        <td></td>
    {/if}
</tr>

<style>
    .tr {
        border: 1px solid #303030;
    }

    .td {
        padding: 0.1em 0.05em 0.1em 0.4em;
        position: relative;
    }

    .td:last-child {
        padding-right: 0.4em;
    }

    .desc {
        background-color: rgb(var(--cmblack));
        color: white;
        visibility: hidden;
        width: 300px;
        text-align: center;
        border-radius: 0.5em;
        position: absolute;
        z-index: 1;
        top: 100%;
        left: 0;
    }

    .td:hover .desc {
        visibility: visible;
    }

    .td:hover .desc:hover {
        visibility: hidden;
    }
</style>
