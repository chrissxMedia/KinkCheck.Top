<script lang="ts">
    import { ratings } from "../base";

    const {
        text,
        rating,
        setRating,
        clickable,
    }: {
        text: string;
        rating: number;
        setRating?: (r: number) => void;
        clickable: boolean;
    } = $props();

    const handleClick = !setRating
        ? undefined
        : (e: MouseEvent) => {
              e.preventDefault();
              const step = e.shiftKey || e.altKey ? 0.5 : 1;
              let newRating = e.button ? rating - step : rating + step;
              const max = ratings.length - 1;
              if (newRating === 0.5) newRating = e.button ? 0 : 1;
              else if (newRating > max) newRating = 0;
              else if (newRating < 0) newRating = max;
              setRating(newRating);
          };

    function background(rating: number): string {
        if (rating % 1 === 0) return ratings[rating][1];
        return `linear-gradient(135deg, ${ratings[Math.floor(rating)][1]} 0%, ${ratings[Math.ceil(rating)][1]} 100%)`;
    }
</script>

<div
    class={clickable ? "clickable" : "noclick"}
    onclick={handleClick}
    oncontextmenu={handleClick}
>
    <button style={`background: ${background(rating)}`} />
    <span class="position">{text}</span>
</div>

<style>
    .clickable,
    .noclick {
        display: flex;
        flex-direction: row;
    }

    .clickable button,
    .noclick button {
        width: 1em;
        height: 1em;
        border: none;
        border-radius: 0;
        margin-right: 0.1875em;
        padding: 0 0.5em;
    }

    .clickable,
    .clickable * {
        cursor: pointer;
        user-select: none;
    }

    .position {
        margin-top: -0.05em;
    }

    /* Horrible hack */
    :global(body.screenshot) .noclick button,
    :global(body.screenshot) .clickable button {
        width: 16pt;
        height: 16pt;
    }
</style>
