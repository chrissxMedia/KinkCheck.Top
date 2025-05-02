<script lang="ts">
    import { onMount } from "svelte";

    const colors: { [k: string]: string } = {
        t: "rgb(var(--transblue))",
        r: "rgb(var(--transpink))",
        a: "white",
        n: "rgb(var(--transpink))",
        s: "rgb(var(--transblue))",
    };

    let input: HTMLInputElement;
    onMount(() => input.focus());

    let flag = $state("");
    let chars = $derived(
        [...flag.toLowerCase()].filter((x) => "trans".includes(x)),
    );
    let height = $derived(20 / chars.length);
</script>

<main>
    <input
        bind:this={input}
        type="text"
        placeholder="trans, rat, ant, ..."
        spellcheck={false}
        autocorrect="off"
        bind:value={flag}
    />
    {#if chars.length}
        {#each chars as x}
            <div
                style={`background-color: ${colors[x]}; height: ${height}em`}
            ></div>
        {/each}
    {:else}
        <div style="background-color: transparent; height: 20em"></div>
    {/if}
</main>

<style>
    input {
        margin: 0.5em 0;
        border: 0;
        padding: 0.25em;
        font-size: 2em;
        width: 14.5em;
        background-color: rgb(var(--cmblack));
        color: white;
    }
    div {
        width: 30em;
    }
</style>
